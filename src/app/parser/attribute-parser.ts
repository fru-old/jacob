// Error handling

export class ParsingError {

  constructor(private input: string) {}

  private errorPosition(token: TokenResult) {
    if (!token || !(token.position >= 0)) return ' in attribute: ' + this.input;
    return ' at position ' + token.position + ' in attribute: ' + this.input;
  }

  private error(message: string, addTokenContent: boolean = false) {
    return (token: TokenResult = null) => {
      let currentChar = (addTokenContent ? (' ' + token.content) : '');
      return message + currentChar + this.errorPosition(token);
    };
  }

  private getName(token: TokenResult) {
    var type = 'token';
    if(token.type === Token.WHITESPACE) type = 'whitespace';
    if(token.type === Token.LITERAL) type = 'name';
    if(token.type === Token.STRING) type = 'string';
    if(token.type === Token.DIGITS) type = 'number';
    if(token.type === Token.SYMBOL) type = 'symbol';
    if(token.type === Token.END) type = 'end';
    return type + ' ' + token.content;
  }

  // Tokenizer
  public nonTerminatedString = this.error('Non-terminated string');

  // Parser
  public notNumber(number: string) {
    return 'Not a number ' + number + this.errorPosition(null);
  }
  public unexpected(token: TokenResult, context: string = null) {
    var position = (context ? ' ' + context : '') + this.errorPosition(token);
    return 'Unexpected ' + this.getName(token) + position;
  }

}

// Tokenizing

enum Token {
  WHITESPACE,
  LITERAL,
  STRING,
  DIGITS,
  SYMBOL,
  END
}

type TokenResult = {type: Token, content: string, position: Number};

export class AttributeTokenizer {

  constructor(private error: ParsingError) {}

  getEndOfString(input: string, position: number) {
    let type = input[position]; // must be " or '
    let content = '';
    let escaped = false;
    for(let i = position + 1; i < input.length; i++) {
      let c = input[i];
      if (c === '\\' && !escaped) escaped = true;
      else if (c === type && !escaped) return {content, position: i};
      else {
        content += c;
        escaped = false;
      }
    }
    return null;
  }

  getTokenType(input: string, position: number) {
    let c = input[position];
    if (c === ' ' || c === '\n' || c === '\t' || c === '\r') return Token.WHITESPACE;
    else if (c === ':' || c === '(' || c === ')' || c === ',' || c === '-') return Token.SYMBOL;
    else if (c === '"' || c === '\'') return Token.STRING;
    else if (+c >= 0) return Token.DIGITS;
    else return Token.LITERAL;
  }

  tokenize(input: string): TokenResult[] {
    let result = [];
    let previous = null;

    function finishPrevious() {
      if (previous !== null) result.push(previous);
      previous = null;
    }

    for(let position = 0; position < input.length; position++) {
      let type = this.getTokenType(input, position);

      if (previous && type === previous.type) {
        previous.content += input[position];
        continue;
      }
      finishPrevious();

      if (type === Token.SYMBOL) {
        result.push({type, content: input[position], position});
      } else if (type === Token.STRING) {
        let end = this.getEndOfString(input, position);
        if (end === null) throw this.error.nonTerminatedString();
        else {
          position = end.position;
          result.push({type, content: end.content, position});
        }
      } else {
        previous = {type, content: input[position], position};
      }
    }

    finishPrevious();
    result.push({type: Token.END, content: null, position: null})
    return result;
  }
}

interface AttributeResult {
  type: string;
  name: string;
  args: any[];
  [x: string]: any;
}

enum State {
  INITIAL,

  FIRST_LITERAL,
  FIRST_LITERAL_WHITESPACE,
  SECOND_LITERAL,
  SECOND_LITERAL_WHITESPACE,

  AFTER_NAME_COLON,

  START_PARAMETER,
  COMMA_PARAMETER,
  IN_PARAMETER,
  AFTER_PARAMETER
}

export class AttributeParser {

  transition(state: State, tokens: TokenResult[], error: ParsingError): AttributeResult {
    let name = null;
    let type = null;
    let args = [];
    let result = {};
    let self = this;

    function transitionLiteral(content: string, token: Token, isFirst: boolean, afterWhitespace: boolean) {
      if (token === Token.LITERAL || token === Token.DIGITS) {
        type += content;
      } else if (token === Token.WHITESPACE) {
        type += content;
        state = isFirst ? State.FIRST_LITERAL_WHITESPACE : State.SECOND_LITERAL_WHITESPACE;
      } else if (token === Token.SYMBOL && content === '(' && !afterWhitespace) {
        state = State.START_PARAMETER;
      } else if (token === Token.SYMBOL && content === ':' && !afterWhitespace && isFirst) {
        state = State.AFTER_NAME_COLON;
        name = type;
        type = null;
      } else if (token !== Token.END) {
        throw error.unexpected(tokens[i]);
      }
    }

    let parameterLiteral = null;
    let parameterName = null;
    let parameterNameFinished = false;
    let parameterNumber = null;
    let parameterValue = null;
    let parameterFinished = false;

    function readParameterToken(content: string, token: Token, original: TokenResult, isFirstToken: boolean) {
      if (parameterFinished) throw error.unexpected(original);

      if (isFirstToken && token === Token.LITERAL) {
        parameterLiteral = content;
      } else if (parameterNumber) {
        if (token === Token.DIGITS || token === Token.LITERAL) {
          parameterNumber += content;
        } else {
          throw error.unexpected(original);
        }
      } else if (isFirstToken || parameterNameFinished) {
        if ((token === Token.SYMBOL && content === '-') || token === Token.DIGITS) {
          parameterNumber = content;
        } else if (token === Token.STRING) {
          parameterValue = content;
          parameterFinished = true;
        } else if (token === Token.LITERAL && self.isConstant(content)) {
          parameterValue = self.getConstantValue(content);
          parameterFinished = true;
        } else if (token !== Token.WHITESPACE && !parameterNumber) {
          throw error.unexpected(original);
        }
      } else if (parameterLiteral) {
        if (token === Token.DIGITS || token === Token.WHITESPACE || token === Token.LITERAL) {
          parameterLiteral += content;
        } else if (token === Token.SYMBOL && content === ':') {
          parameterName = parameterLiteral;
          parameterLiteral = null;
          parameterNameFinished = true;
        } else {
          throw error.unexpected(original);
        }
      }
    }

    function finishParameter(original: TokenResult) {
      if (parameterLiteral) {
        if(!self.isConstant(parameterLiteral)) throw error.unexpected(original);
        parameterValue = self.getConstantValue(parameterLiteral);
      }

      if (parameterNumber) {
        parameterValue = +parameterNumber;
        if(isNaN(parameterValue)) throw error.notNumber(parameterValue);
      } else if (parameterNameFinished && !parameterFinished) {
        throw error.unexpected(original);
      }

      if(parameterName) result[parameterName.trim()] = parameterValue;
      else args.push(parameterValue);

      parameterLiteral = null;
      parameterName = null;
      parameterNameFinished = false;
      parameterNumber = null;
      parameterValue = null;
      parameterFinished = false;
    }


    for (var i = 0; i < tokens.length; i++) {
      let content = tokens[i].content;
      let token = tokens[i].type;

      // INITIAL -> FIRST_LITERAL | START_PARAMETER
      if (state === State.INITIAL) {
        if (token === Token.LITERAL || token === Token.DIGITS) {
          type = content;
          state = State.FIRST_LITERAL;
        } else if (token === Token.SYMBOL && content === '(') {
          state = State.START_PARAMETER;
        } else {
          throw error.unexpected(tokens[i]);
        }
      }

      // FIRST_LITERAL -> self | FIRST_LITERAL_WHITESPACE | START_PARAMETER | AFTER_NAME_COLON
      else if (state === State.FIRST_LITERAL) {
        transitionLiteral(content, token, true, false);
      }
      // FIRST_LITERAL_WHITESPACE -> self | FIRST_LITERAL | FIRST_LITERAL_WHITESPACE | START_PARAMETER | AFTER_NAME_COLON
      else if (state === State.FIRST_LITERAL_WHITESPACE) {
        transitionLiteral(content, token, true, true);
      }
      // SECOND_LITERAL -> self | SECOND_LITERAL_WHITESPACE | START_PARAMETER
      else if (state === State.SECOND_LITERAL) {
        transitionLiteral(content, token, false, false);
      }
      // SECOND_LITERAL_WHITESPACE -> self | SECOND_LITERAL | SECOND_LITERAL_WHITESPACE
      else if (state === State.SECOND_LITERAL_WHITESPACE) {
        transitionLiteral(content, token, false, true);
      }

      // AFTER_NAME_COLON -> SECOND_LITERAL
      else if (state === State.AFTER_NAME_COLON) {
        if (token === Token.LITERAL || token === Token.DIGITS) {
          type = content;
          state = State.SECOND_LITERAL;
        } else if (token === Token.SYMBOL && content === '(') {
          state = State.START_PARAMETER;
        } else if (token !== Token.WHITESPACE) {
          throw error.unexpected(tokens[i]);
        }
      }

      // START_PARAMETER -> self | AFTER_PARAMETER | IN_PARAMETER
      else if (state === State.START_PARAMETER) {
        if(token === Token.SYMBOL && content === ')') {
          state = State.AFTER_PARAMETER;
        } else if(token === Token.SYMBOL && content === ',') {
          throw error.unexpected(tokens[i]);
        } else if (token !== Token.WHITESPACE) {
          state = State.IN_PARAMETER;
          readParameterToken(content, token, tokens[i], true);
        }
      }

      // COMMA_PARAMETER -> self | IN_PARAMETER
      else if (state === State.COMMA_PARAMETER) {
        if(token === Token.SYMBOL && content === ',') {
          throw error.unexpected(tokens[i]);
        } else if (token !== Token.WHITESPACE) {
          state = State.IN_PARAMETER;
          readParameterToken(content, token, tokens[i], true);
        }
      }

      // IN_PARAMETER -> self | AFTER_PARAMETER | COMMA_PARAMETER
      else if (state === State.IN_PARAMETER) {
        if(token === Token.SYMBOL && content === ')') {
          finishParameter(tokens[i]);
          state = State.AFTER_PARAMETER;
        } else if(token === Token.SYMBOL && content === ',') {
          finishParameter(tokens[i]);
          state = State.COMMA_PARAMETER;
        } else {
          readParameterToken(content, token, tokens[i], false);
        }
      }

      else if (state === State.AFTER_PARAMETER) {
        if(token !== Token.END) {
          throw error.unexpected(tokens[i]);
        }
      }
    }

    if(state !== State.AFTER_PARAMETER && state !== State.AFTER_NAME_COLON &&
       state !== State.SECOND_LITERAL && state !== State.FIRST_LITERAL ) {
         throw error.unexpected(tokens[tokens.length - 1]);
       }

    return {name, type, args, ...result};
  }

  isConstant(value: string) {
    value = value.trim();
    return value === 'undefined' || value === 'null' || value === 'NaN' || value === 'true' || value === 'false';
  }

  getConstantValue(value: string) {
    value = value.trim();
    if(value === 'undefined') return undefined;
    if(value === 'null') return null;
    if(value === 'NaN') return NaN;
    if(value === 'true') return true;
    if(value === 'false') return false;
  }

  parse(input: string): AttributeResult {
    let error = new ParsingError(input)
    let tokenizer = new AttributeTokenizer(error);
    let tokens = tokenizer.tokenize(input);
    return this.transition(State.INITIAL, tokens, error);
  }
}
