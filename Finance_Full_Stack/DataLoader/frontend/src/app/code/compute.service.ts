import { Injectable } from '@angular/core';
import { DataEngService } from '../api/data-eng.service';
import { Value, ValueType, Val } from '../types/compute';
import { AggSupportInfo, AggCode } from '../types/compute';
import { CodeUnit, AggType, FormatInfo } from '../types/compute';
import { aggSupportCodeToStr } from '../types/compute';
import { WorkData } from '../api/data-eng.service';
import { codeDebug } from '../../constants';

export type ParseErrorDisplayFunc =
  (errMsg: string, parseStr: string, parsePos: number) => void;

export const singleAgg = true;

type PrsProc = (pi: PrsInfo) => void;
type ExecProc = () => void;

const PREC_EXPRESSION_BEGIN = 0;
const PREC_LEFT_PAREN = 1;
const PREC_COMPARE = 5;
const PREC_ADD = 25;
const PREC_MUL = 30;
const PREC_EXPONENT = 35;
const PREC_NEG = 40;
const PREC_RIGHT_PAREN = -1;
const PREC_COMMA = -2;

const PREC_FUNCTION = 100;

class PrsInfo {

  constructor(
    public prs: PrsProc,
    public prec: number,
  ) { }
}

type OpStkCell = {
  op: string;
  boolEx: number;
  numEx: number;
  strEx: number;
  outTp: ValueType;
  prec: number;
  prsPos: number;
};

type ExpressionReturn = {
  valTp: ValueType;
  endStr: string;
};

// type ColumnNameReturn = {
//   ix: number;
//   endChar: string;
// }

type BreakTotalReturn = {
  tp: ValueType;
  valIx: number;
};

@Injectable({
  providedIn: 'root'
})
export class ComputeService {
  opStk: OpStkCell[] = [];
  tpStk: ValueType[] = [];
  execs: ExecProc[] = [];

  // names of p-code routines
  dbgExecs: string[] = [];
  currCodeUnit: CodeUnit;

  dict = new Map<string, PrsInfo>();

  stk: Value[] = [];
  pgmCounter = 0;

  // prsStr = 'text(67.890123,"0000.00")';
  prsStr = 'text(12345678.90123,"$#,##0.00")';
  // prsStr = 'round(33.45,1)'
  // prsStr = ' if(and(1 < 2, 4 < 5, 7 < 8),8,9)';
  // prsStr = ' not(100/(5+4) > 20)';
  // prsStr = ' if(and(201 / (6 - -4) > 20,5 <8), 100, 1)';
  // prsStr = ' if(100 / (6 - -4) > 20, 100, 1)';
  prsPos = 0;
  prsError = '';
  prsErrorPos = 0;

  currRowNm = 0;

  cdNoop;
  cdEnd;

  cdZero;
  cdOne;
  cdTwo;
  cdNegOne;
  cdFalse;
  cdTrue;
  cdEmptyStr;

  cdBoolEq;
  cdBoolNotEq;
  cdBoolGreater;
  cdBoolGreaterEq;
  cdBoolLess;
  cdBoolLessEq;

  cdNumEq;
  cdNumNotEq;
  cdNumGreater;
  cdNumGreaterEq;
  cdNumLess;
  cdNumLessEq;

  cdStrEq;
  cdStrNotEq;
  cdStrGreater;
  cdStrGreaterEq;
  cdStrLess;
  cdStrLessEq;

  cdNot;
  cdAnd;
  cdOr;

  cdAdd;
  cdSub;
  cdMul;
  cdDiv;
  cdExp;
  cdNeg;

  cdMod;
  cdQuotient;
  cdRound;
  cdFloor;
  cdCeiling;

  cdCode;
  cdChar;
  cdLen;
  cdText;
  cdLower;
  cdUpper;
  cdConcat;
  cdLeft;
  cdMid;
  cdRight;
  cdTrim;

  cdNumLiteral;
  cdStrLiteral;
  cdColumn;
  cdComputed;
  cdRowLabel;
  cdRowNm;
  cdIfNotBranch;
  cdBranch;

  // transformation functions
  cdGroupBy;
  cdBreakCume;
  cdAgg;

  constructor(
    private dataEng: DataEngService,
  ) {
    this.dict.set('(', new PrsInfo(this.prsLeftParen, PREC_LEFT_PAREN));
    this.dict.set('=', new PrsInfo(this.prsEq, PREC_COMPARE));
    this.dict.set('<>', new PrsInfo(this.prsNotEq, PREC_COMPARE));
    this.dict.set('>', new PrsInfo(this.prsGreater, PREC_COMPARE));
    this.dict.set('>=', new PrsInfo(this.prsGreaterEq, PREC_COMPARE));
    this.dict.set('<', new PrsInfo(this.prsLess, PREC_COMPARE));
    this.dict.set('<=', new PrsInfo(this.prsLessEq, PREC_COMPARE));

    this.dict.set('+', new PrsInfo(this.prsAdd, PREC_ADD));
    this.dict.set('-', new PrsInfo(this.prsSub, PREC_ADD));
    this.dict.set('*', new PrsInfo(this.prsMul, PREC_MUL));
    this.dict.set('/', new PrsInfo(this.prsDiv, PREC_MUL));
    this.dict.set('^', new PrsInfo(this.prsExp, PREC_EXPONENT));

    this.dict.set(')', new PrsInfo(this.prsRightParen, PREC_RIGHT_PAREN));
    this.dict.set(',', new PrsInfo(this.prsComma, PREC_COMMA));

    this.dict.set('and', new PrsInfo(this.prsAnd, PREC_FUNCTION));
    this.dict.set('not', new PrsInfo(this.prsNot, PREC_FUNCTION));
    this.dict.set('or', new PrsInfo(this.prsOr, PREC_FUNCTION));

    this.dict.set('mod', new PrsInfo(this.prsMod, PREC_FUNCTION));
    this.dict.set('quotient', new PrsInfo(this.prsQuotient, PREC_FUNCTION));
    this.dict.set('round', new PrsInfo(this.prsRound, PREC_FUNCTION));
    this.dict.set('ceiling', new PrsInfo(this.prsCeiling, PREC_FUNCTION));
    this.dict.set('floor', new PrsInfo(this.prsFloor, PREC_FUNCTION));

    this.dict.set('code', new PrsInfo(this.prsCode, PREC_FUNCTION));
    this.dict.set('char', new PrsInfo(this.prsChar, PREC_FUNCTION));
    this.dict.set('len', new PrsInfo(this.prsLen, PREC_FUNCTION));
    this.dict.set('text', new PrsInfo(this.prsText, PREC_FUNCTION));
    this.dict.set('lower', new PrsInfo(this.prsLower, PREC_FUNCTION));
    this.dict.set('upper', new PrsInfo(this.prsUpper, PREC_FUNCTION));
    this.dict.set('concat', new PrsInfo(this.prsConcat, PREC_FUNCTION));
    this.dict.set('left', new PrsInfo(this.prsLeft, PREC_FUNCTION));
    this.dict.set('mid', new PrsInfo(this.prsMid, PREC_FUNCTION));
    this.dict.set('right', new PrsInfo(this.prsRight, PREC_FUNCTION));
    this.dict.set('trim', new PrsInfo(this.prsTrim, PREC_FUNCTION));

    this.dict.set('if', new PrsInfo(this.prsIf, PREC_FUNCTION));

    this.dict.set('column', new PrsInfo(this.prsColumn, PREC_FUNCTION));
    this.dict.set('rowNumber', new PrsInfo(this.prsRowNm, PREC_FUNCTION));
    this.dict.set(WorkData.groupBy,
      new PrsInfo(this.prsGroupBy, PREC_FUNCTION));
    this.dict.set('_breakCume_',
      new PrsInfo(this.prsBreakCume, PREC_FUNCTION));
    this.dict.set('agg', new PrsInfo(this.prsAgg, PREC_FUNCTION));

// 4567891234567892123456789312345678941234567895123456789612345678971234567898
    this.cdEnd = this.exec('end', this.end);
    this.cdNoop = this.exec('noop', this.noop);

    this.cdZero = this.exec('zero', this.zero);
    this.cdOne = this.exec('one', this.one);
    this.cdTwo = this.exec('two', this.two);
    this.cdNegOne = this.exec('negOne', this.negOne);
    this.cdFalse = this.exec('false', this.false);
    this.cdTrue = this.exec('true', this.true);
    this.cdEmptyStr = this.exec('emptyStr', this.emptyStr);

    this.cdBoolEq = this.exec('eq', this.boolEq);
    this.cdBoolNotEq = this.exec('notEq', this.boolNotEq);
    this.cdBoolGreater = this.exec('greater', this.boolGreater);
    this.cdBoolGreaterEq = this.exec('greaterEq', this.boolGreaterEq);
    this.cdBoolLess = this.exec('less', this.boolLess);
    this.cdBoolLessEq = this.exec('lessEq', this.boolLessEq);

    this.cdNumEq = this.exec('eq', this.numEq);
    this.cdNumNotEq = this.exec('notEq', this.numNotEq);
    this.cdNumGreater = this.exec('greater', this.numGreater);
    this.cdNumGreaterEq = this.exec('greaterEq', this.numGreaterEq);
    this.cdNumLess = this.exec('less', this.numLess);
    this.cdNumLessEq = this.exec('lessEq', this.numLessEq);

    this.cdStrEq = this.exec('eq', this.strEq);
    this.cdStrNotEq = this.exec('notEq', this.strNotEq);
    this.cdStrGreater = this.exec('greater', this.strGreater);
    this.cdStrGreaterEq = this.exec('greaterEq', this.strGreaterEq);
    this.cdStrLess = this.exec('less', this.strLess);
    this.cdStrLessEq = this.exec('lessEq', this.strLessEq);

    this.cdNot = this.exec('not', this.not);
    this.cdAnd = this.exec('and', this.and);
    this.cdOr = this.exec('or', this.or);

    this.cdAdd = this.exec('add', this.numAdd);
    this.cdSub = this.exec('sub', this.numSub);
    this.cdMul = this.exec('mul', this.numMul);
    this.cdDiv = this.exec('div', this.numDiv);
    this.cdExp = this.exec('exp', this.numExp);
    this.cdNeg = this.exec('neg', this.numNeg);

    this.cdMod = this.exec('mod', this.mod);
    this.cdQuotient = this.exec('quotient', this.quotient);
    this.cdRound = this.exec('round', this.round);
    this.cdFloor = this.exec('floor', this.floor);
    this.cdCeiling = this.exec('ceiling', this.ceiling);

    this.cdCode = this.exec('code', this.code);
    this.cdChar = this.exec('char', this.char);
    this.cdLen = this.exec('length', this.len);
    this.cdText = this.exec('text', this.text);
    this.cdLower = this.exec('lower', this.lower);
    this.cdUpper = this.exec('upper', this.upper);
    this.cdConcat = this.exec('concat', this.concat);
    this.cdLeft = this.exec('left', this.left);
    this.cdMid = this.exec('mid', this.mid);
    this.cdRight = this.exec('right', this.right);
    this.cdTrim = this.exec('trim', this.trim);

    this.cdIfNotBranch = this.exec('ifNotBranch', this.ifNotBranch);
    this.cdBranch = this.exec('branch', this.branch);

    this.cdNumLiteral = this.exec('numLiteral', this.numLiteral);
    this.cdStrLiteral = this.exec('strLiteral', this.strLiteral);
    this.cdColumn = this.exec('column', this.column);
    this.cdComputed = this.exec('computed', this.computed);
    this.cdRowLabel = this.exec('rowLabel', this.rowLabel);
    this.cdRowNm = this.exec('rowNm', this.rowNm);

    this.cdGroupBy = this.exec(WorkData.groupBy, this.groupBy);
    this.cdBreakCume = this.exec('breakCume', this.breakCume);
    this.cdAgg = this.exec('agg', this.agg);

    this.dataEng.hookupComputeEng(this, codeDebug);
  }

  public compileCode(
    cu: CodeUnit, errorFunc?: ParseErrorDisplayFunc): ValueType {
    if (codeDebug) {
      console.log(`Source: '${cu.source}'`);
    }
    if (!cu.source) {
      return ValueType.undef;
    }
    let error = false;
    this.opStk.length = 0;
    this.tpStk.length = 0;
    this.stk.length = 0;
    this.currCodeUnit = cu;
    this.currCodeUnit.formats = [];
    this.currCodeUnit.formatCount = 0;
    this.currCodeUnit.dependentOn = [];
    this.currCodeUnit.code = [];
    this.pgmCounter = 0;
    this.prsStr = cu.source;
    this.prsPos = 0;

    try {
      this.prsExpression();
      this.compile(this.cdEnd);
    } catch (e) {
      if (errorFunc) {
        errorFunc(e.toString(), this.prsStr, this.prsErrorPos);
      }
      console.log('error:', this.prsError);
      console.log(`error at: '${
        this.prsStr.substr(0, this.prsErrorPos)}'<--`);
      // the below line prints the call stack
      // console.log('ERROR CATCH -- error =', e);
      error = true;
      for (let i = 0; i < this.pgmCounter; i++) {
        console.log(`i: ${i} code = ${this.currCodeUnit.code[i]}`);
      }
      console.log('Aborted due to error');
      cu.type = ValueType.error;
      return ValueType.error;
    }
    cu.type = this.tpStk[0];
    if (codeDebug) {
      console.log('Done Compiling', this.tpStkStr());
    }
    return this.tpStk[0];
  };

  public execute = (cu: CodeUnit, rowNm: number, val: Value): void => {
    if (rowNm === 0 && codeDebug) {
      console.log('XXXXXXXXXX COL', cu.ix, 'TYPE', cu.type);
    }
    if (cu.type === ValueType.error || cu.type === ValueType.undef) {
      val.type = ValueType.error;
      val.val = 0;
      return;
    }
    let debug: boolean;
    if (rowNm !== 0) {
      debug = false;
    } else {
      debug = codeDebug;
    }
    this.currRowNm = rowNm;
    this.currCodeUnit = cu;
    if (this.currCodeUnit.code.length === 1) {
      return;
    }
    try {
      if (debug) {
        for (let i = 0; i < this.currCodeUnit.code.length; i++) {
          if (this.currCodeUnit.code[i] < 0) {
            const skip = -this.currCodeUnit.code[i];
            i++;
            const instrtuctionEnd = i + skip;
            console.log(`${i.toString().padStart(3, ' ')} code = ${
              this.dbgExecs[this.currCodeUnit.code[i] as number]}`);
            for (let j = i + 1; j <= instrtuctionEnd; j++) {
              console.log(`${j.toString().padStart(3, ' ')} data = ${
                this.currCodeUnit.code[j]}`);
            }
            i += skip;
          } else {
            console.log(`${i.toString().padStart(3, ' ')} code = ${
              this.dbgExecs[this.currCodeUnit.code[i] as number]}`);
          }
        }
      }
      this.pgmCounter = 0;
      this.pgmCounter = 0;
      for (;; this.pgmCounter++) {
        const procCd = this.currCodeUnit.code[this.pgmCounter] as number;
        if (procCd === this.cdEnd) {
          break;
        }
        if (procCd < 0) {
          continue;
        }
        this.execs[procCd]();
      }
    } catch (e) {
      // Check for parse error vs. execution error
      console.log(`row ${this.currRowNm + 1} error at: '${
        this.prsStr.substr(0, this.prsErrorPos + 1)}'<--`);
      console.log('ERROR CATCH -- error =', e);

      for (let i = 0; i < this.pgmCounter; i++) {
        console.log(`i: ${i} code = ${this.currCodeUnit.code[i]}`);
      }
      val.type = ValueType.error;
      val.val = 0;
      return;
    }
    if (this.stk.length !== 1) {
      console.log('End Stack Too Big', this.stkStr());
    }
    if (rowNm === 0 && codeDebug) {
      console.log('ROW', rowNm, 'END OF EXEC', this.stkStr());
    }
    const value = this.stk.pop();
    val.type = value.type;
    val.val = value.val;
    return;
  };

  // Parse functions

  prsValue = (): ExpressionReturn => {
    let valTp = ValueType.undef;
    let hasNeg = false;
    if (this.prsStr[this.prsPos] === '(') {
      this.prsPos++;
      const pi = this.dict.get('(');
      this.prsLeftParen(pi as PrsInfo);
      const eRet = this.prsSubExpression(')');
      return eRet;
    }
    if (this.prsStr[this.prsPos] === '+') {
      this.prsPos++;
    } else {
      if (this.prsStr[this.prsPos] === '-') {
        this.prsPos++;
        hasNeg = true;
      }
    }
    if (this.prsSkipSpaces()) {
      return { valTp, endStr: '' };
    }
    valTp = this.prsLiteral(hasNeg);
    if (valTp === ValueType.undef) {
      valTp = this.prsIdentifier();
      if (hasNeg) {
        this.prsNeg(valTp);
      }
    }
    const eReturn = { valTp, endStr: '' };
    return eReturn;
  };

  prsOpAndValue = (valTp: ValueType): ExpressionReturn => {
    const newValTp = ValueType.undef;
    if (this.prsPos >= this.prsStr.length) {
      return { valTp: newValTp, endStr: '' };
    }
    if (this.prsSkipSpaces()) {
      return { valTp: newValTp, endStr: '' };
    }
    const pi = this.prsOp();
    if (!pi) {
      return { valTp: newValTp, endStr: '' };
    }
    pi.prs(pi);
    if (this.prsSkipSpaces()) {
      return { valTp: newValTp, endStr: '' };
    }
    const eReturn = this.prsValue();
    if (eReturn.valTp === ValueType.undef) {
      this.prsError = 'Expression expected';
      this.prsErrorPos = this.prsPos;
      throw new Error(this.prsError);
    }
    return eReturn;
  };

  prsMatchEnd = (endStr: string): number => {
    for (let i = 0; i < endStr.length; i++) {
      if (this.prsStr[this.prsPos] === endStr[i]) {
        if (codeDebug) {
          console.log(`EndString >${this.prsStr[this.prsPos]}<`);
        }
        const pi = this.dict.get(this.prsStr[this.prsPos]);
        this.prsPos++;
        if (pi) {
          pi.prs(pi);
        }
        return i;
      }
    }
    return -1;
  };

  prsSubExpression = (endStr: string): ExpressionReturn => {
    let valTp = ValueType.undef;
    let eReturn;
    if (this.prsSkipSpaces()) {
      return { valTp, endStr: '' };
    }
    eReturn = this.prsValue();
    if (this.prsSkipSpaces()) {
      return { valTp, endStr: '' };
    }
    for (;;) {
      const m1 = this.prsMatchEnd(endStr);
      if (m1 !== -1) {
        return { valTp: this.tpStk[this.tpStk.length - 1],
          // endStr: endStr.substr(m1, 1) };
          endStr: endStr[m1] };
      }
      eReturn = this.prsOpAndValue(valTp);
      if (eReturn.valTp !== ValueType.undef) {
        valTp = eReturn.valTp;
      }
      if (this.prsSkipSpaces()) {
        return { valTp, endStr: '' };
      }
    }
  };

  prsExpression = (
    type: ValueType = ValueType.undef,
    endStr: string = '',
  ): ExpressionReturn => {
    const eReturn = this.prsSubExpression(endStr);
    const valTp = this.prsFlushOperator(PREC_COMMA);
    eReturn.valTp = valTp;

    if (type !== ValueType.undef && type !== valTp && type) {
      if (type !== ValueType.boolNum ||
        (valTp !== ValueType.bool && valTp !== ValueType.num)) {
        const errorStr = `Expected ${this.typeStr(type)} type but got ${
          this.typeStr(valTp)}`;
        this.prsError = errorStr;
        this.prsErrorPos = this.prsPos - 1;
        throw new Error(this.prsError);
      }
    }
    return eReturn;
  };

  prsFunctionStart = (): void => {
    if (!this.prsSkipSpaces()) {
      if (this.prsStr[this.prsPos] === '(') {
        this.prsPos++;
        } else {
        this.prsError = `'(' expected`;
        throw new Error(this.prsError);
      }
    }
  };

  prsIsSpace = (): boolean => {
    // const str = this.prsStr.substr(this.prsPos, 1);
    const str = this.prsStr[this.prsPos];
    return str === ' ' || str === '\t' || str === '\n' || str === '\r' ||
      str === '';
  };

  prsSkipSpaces = (): boolean => {
    while (!this.prsStr[this.prsPos] || this.prsIsSpace()) {
      if (this.prsPos >= this.prsStr.length) {
        return true;
      }
      this.prsPos++;
    }
    return false;
  };

  prsIsNum = (): boolean => {
    // const str = this.prsStr.substr(this.prsPos, 1);
    const str = this.prsStr[this.prsPos];
    return '0' <= str && str <= '9' || str === '.';
  };

  // 0: no boolean, 1: true, 2: false
  prsBoolLiteral = (): number => {
    const str1 = this.prsStr.substr(this.prsPos, 4).toUpperCase();
    let isBool = str1 === 'TRUE';
    if (isBool) {
      this.prsPos += 4;
      return 1;
    } else {
      const str2 = this.prsStr.substr(this.prsPos, 5).toUpperCase();
      isBool = str2 === 'FALSE';
      if (isBool) {
        this.prsPos += 5;
        return 2;
      }
    }
    return 0;
  };

  prsLiteral = (isNeg: boolean): ValueType => {
    // const char = this.prsStr.substr(this.prsPos, 1);
    const char = this.prsStr[this.prsPos];
    if (char === `'` || char === `"`) {
      const target = char;
      for (let i = this.prsPos + 1; ;) {
        if (this.prsStr[i] === target) {
          const str = this.prsStr.substr(this.prsPos + 1,
            i - this.prsPos - 1);
          if (str.length === 0) {
            this.compile(this.cdEmptyStr);
          } else {
            this.compile(this.cdStrLiteral, str);
          }
          this.tpStk.push(ValueType.str);
          this.prsPos = i + 1;
          if (isNeg) {
            this.prsNeg(ValueType.str);
          }
          return ValueType.str;
        }
        i++;
        if (this.prsStr.length <= i) {
          this.prsError = 'End of code reached';
          this.prsErrorPos = i;
          console.log(this.prsError);
          throw new Error(this.prsError);
        }
      }
    } else if (this.prsIsNum()) {
      const start = this.prsPos;
      do {
        this.prsPos++;
      } while (this.prsIsNum());
      const num = Number(this.prsStr.substr(start,
        this.prsPos - start));
      if (num === 0) {
        this.compile(this.cdZero);
        isNeg = false;
      } else if (num === 1) {
        this.compile(isNeg ? this.cdNegOne : this.cdOne);
        isNeg = false;
      } else if (num === 2) {
        this.compile(this.cdTwo);
      } else {
        this.compile(this.cdNumLiteral, num);
      }
      this.tpStk.push(ValueType.num);
      if (isNeg) {
        this.prsNeg(ValueType.num);
      }
      return ValueType.num;
    }
    const boolCheck = this.prsBoolLiteral();
    if (boolCheck) {
      this.tpStk.push(ValueType.bool);
      this.compile(boolCheck === 1 ? this.cdTrue : this.cdFalse);
      if (isNeg) {
        this.prsNeg(ValueType.bool);
      }
      return ValueType.bool;
    }
    return ValueType.undef;
  };

  // prsComputed = (ix: number): ValueType => {
  //   this.compile(this.cdComputed, ix);
  //   return this.data.computeds[ix].getType();
  // }

  // prsVariable = (ix: number): ValueType => {
  //   this.compile(this.cdVariable, ix);
  //   return this.data.variables[ix].getType();
  // }

  prsIdentifier = (): ValueType => {
    const start = this.prsPos;
    for (;;) {
      // const str = this.prsStr.substr(this.prsPos, 1);
      const str = this.prsStr[this.prsPos];
      if (str !== '_' && !('A' <= str && str <= 'Z')
        && !('a' <= str && str <= 'z')) {
        break;
      }
      this.prsPos++;
    }
    if (start === this.prsPos) {
      return ValueType.undef;
    }
    const varName = this.prsStr.substr(start, this.prsPos - start);
    if (codeDebug) {
      console.log(`Variable >${varName}<`);
    }
    let valTp = ValueType.undef;

    // let ix = this.data.findColumn(varName);
    // if (ix > -1) {
    //   valTp = this.prsColumn(ix);
    // } else {
    //   ix = this.data.findComputed(varName);
    //   if (ix > -1) {
    //     valTp = this.prsComputed(ix);
    //   } else {
    //     ix = this.data.findVariable(varName);
    //     if (ix > -1) {
    //       valTp = this.prsVariable(ix);
    //     } else {
    const pi = this.dict.get(varName);
    if (pi) {
      pi.prs(pi);
      valTp = this.tpStk[this.tpStk.length - 1];
    } else {
      this.prsError = 'Indentifier not recognized';
      this.prsErrorPos = this.prsPos;
      throw new Error(this.prsError);
    }
    //     }
    //   }
    // }
    return valTp;
  };

  prsOp = (): PrsInfo | undefined => {
    let pi;
    const start = this.prsPos;
    for (;;) {
      const str = this.prsStr.substr(this.prsPos, 1);
      if (str !== '=' && str !== '+' && str !== '-' && str !== '*'
        && str !== '/' && str !== '<' && str !== '>' && str !== '!'
        && str !== '%') {
        break;
      }
      this.prsPos++;
    }
    if (start < this.prsPos) {
      const opName = this.prsStr.substr(start, this.prsPos - start);
      if (codeDebug) {
        const str = `Operator >${opName}<`;
        console.log(str.padEnd(40, ' '), this.opStkStr());
      }
      pi = this.dict.get(opName);
    }
    if (!pi || start === this.prsPos) {
      // this.prsError = 'Operator not recognized';
      this.prsError = 'Operator expected';
      this.prsErrorPos = this.prsPos;
      throw new Error(this.prsError);
    }
    return pi;
  };

  tpCd = (valTp: ValueType, boolCd: number, numCd: number,
          strCd: number): number => {
    switch (valTp) {
      case ValueType.bool:
        return boolCd;
      case ValueType.num:
        return numCd;
      case ValueType.str:
        return strCd;
      default:
    }
    return 0;
  };

  prsFlushOperator = (prec: number): ValueType => {
    let tos = this.opStk.length;
    while (0 < tos--) {
      if (this.opStk[tos].prec < prec) {
        break;
      }
      if (prec === PREC_RIGHT_PAREN) {
        if (this.opStk[tos].prec === PREC_LEFT_PAREN) {
          this.opStk.pop();
          break;
        }
      }
      if (prec === PREC_COMMA) {
        if (this.opStk[tos].prec === PREC_EXPRESSION_BEGIN) {
          this.opStk.pop();
          break;
        }
      }
      const op = this.opStk[tos];
      const valTp = this.tpStk[this.tpStk.length - 2];
      if (valTp !== this.tpStk[this.tpStk.length - 1]) {
        this.prsError = `${
          this.typeStr(valTp)} type and ${
          this.typeStr(this.tpStk[this.tpStk.length - 1])
          } type don't match`;
        this.prsErrorPos = this.prsPos;
        throw new Error(this.prsError);
      }
      this.opStk.pop();
      this.tpStk.pop();
      this.tpStk[this.tpStk.length - 1] = op.outTp;
      const exCd = this.tpCd(valTp, op.boolEx, op.numEx, op.strEx);
      if (exCd === this.cdNoop) {
        const tp = this.typeStr(valTp);
        this.prsError = `Operator does not support type ${tp}`;
        this.prsErrorPos = op.prsPos - 1;
        throw new Error(this.prsError);
      }
      this.compile(this.tpCd(valTp, op.boolEx, op.numEx, op.strEx));
    }
    return this.tpStk[this.tpStk.length - 1];
  };

// 4567891234567892123456789312345678941234567895123456789612345678971234567898

  prsLeftParen = (pi: PrsInfo): void => {
    this.opStk.push({
      op: '(',
      boolEx: this.cdNoop,
      numEx: this.cdNoop,
      strEx: this.cdNoop,
      outTp: ValueType.undef,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsRightParen = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
  };

  prsComma = (pi: PrsInfo): void => {
  };

  prsEq = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '=',
      boolEx: this.cdBoolEq,
      numEx: this.cdNumEq,
      strEx: this.cdStrEq,
      outTp: ValueType.bool,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsNotEq = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '<>',
      boolEx: this.cdBoolNotEq,
      numEx: this.cdNumNotEq,
      strEx: this.cdStrNotEq,
      outTp: ValueType.bool,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsGreater = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '>',
      boolEx: this.cdBoolGreater,
      numEx: this.cdNumGreater,
      strEx: this.cdStrGreater,
      outTp: ValueType.bool,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsGreaterEq = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '>=',
      boolEx: this.cdBoolGreaterEq,
      numEx: this.cdNumGreaterEq,
      strEx: this.cdStrGreaterEq,
      outTp: ValueType.bool,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsLess = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '<',
      boolEx: this.cdBoolLess,
      numEx: this.cdNumLess,
      strEx: this.cdStrLess,
      outTp: ValueType.bool,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsLessEq = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '<=',
      boolEx: this.cdBoolLessEq,
      numEx: this.cdNumLessEq,
      strEx: this.cdStrLessEq,
      outTp: ValueType.bool,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsAdd = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '+',
      boolEx: this.cdNoop,
      numEx: this.cdAdd,
      strEx: this.cdNoop,
      outTp: ValueType.num,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsSub = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '-',
      boolEx: this.cdNoop,
      numEx: this.cdSub,
      strEx: this.cdNoop,
      outTp: ValueType.num,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsMul = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '*',
      boolEx: this.cdNoop,
      numEx: this.cdMul,
      strEx: this.cdNoop,
      outTp: ValueType.num,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsDiv = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '/',
      boolEx: this.cdNoop,
      numEx: this.cdDiv,
      strEx: this.cdNoop,
      outTp: ValueType.num,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsExp = (pi: PrsInfo): void => {
    this.prsFlushOperator(pi.prec);
    this.opStk.push({
      op: '^',
      boolEx: this.cdNoop,
      numEx: this.cdExp,
      strEx: this.cdNoop,
      outTp: ValueType.num,
      prec: pi.prec,
      prsPos: this.prsPos,
    });
  };

  prsNeg = (valTp: ValueType): void => {
    if (valTp !== ValueType.num) {
      this.prsError = 'Must be numeric expression';
      this.prsErrorPos = this.prsPos;
      throw new Error(this.prsError);
    }
    this.compile(this.cdNeg);
  };

  // Numeric arithmetic functions

  prsCeiling = (pi: PrsInfo): void => {
    this.prsTwoParFunc(ValueType.num, ValueType.num, this.cdCeiling);
  };

  prsFloor = (pi: PrsInfo): void => {
    this.prsTwoParFunc(ValueType.num, ValueType.num, this.cdFloor);
  };

  prsMod = (pi: PrsInfo): void => {
    this.prsTwoParFunc(ValueType.num, ValueType.num, this.cdMod);
  };

  prsQuotient = (pi: PrsInfo): void => {
    this.prsTwoParFunc(ValueType.num, ValueType.num, this.cdQuotient);
  };

  prsRound = (pi: PrsInfo): void => {
    this.prsTwoParFunc(ValueType.num, ValueType.num, this.cdRound);
  };

  // String functions

  prsCode = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.str, this.cdCode);
    this.tpStk[this.tpStk.length - 1] = ValueType.num;
  };

  prsChar = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.num, this.cdChar);
    this.tpStk[this.tpStk.length - 1] = ValueType.str;
  };

  prsLen = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.str, this.cdLen);
    this.tpStk[this.tpStk.length - 1] = ValueType.num;
  };

  prsText = (pi: PrsInfo): void => {
    this.prsFunctionStart();
    this.prsExpression(ValueType.undef, ',');
    this.prsExpression(ValueType.str, ')');
    this.compile(this.cdText, this.currCodeUnit.formatCount++);
  };

  prsLower = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.str, this.cdLower);
  };

  prsUpper = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.str, this.cdUpper);
  };

  prsConcat = (pi: PrsInfo): void => {
    this.prsFunctionStart();
    let parCount = 0;
    for (;;) {
      parCount++;
      const eReturn = this.prsExpression(ValueType.str, ',)');
      if (eReturn.endStr === ')') {
        break;
      }
    }
    this.compile(this.cdConcat, parCount);
  };

  prsLeft = (pi: PrsInfo): void => {
    this.prsOnePlusOneParFunc(ValueType.str, ValueType.num, 1, this.cdLeft);
  };

  prsMid = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.str, this.cdUpper);
  };

  prsRight = (pi: PrsInfo): void => {
    this.prsOnePlusOneParFunc(ValueType.str, ValueType.num, 1, this.cdRight);
  };

  prsTrim = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.str, this.cdTrim);
  };

  // Logical functions

  prsAnd = (pi: PrsInfo): void => {
    this.prsTwoPlusParFunc(ValueType.bool, ValueType.bool, this.cdAnd);
  };

  prsNot = (pi: PrsInfo): void => {
    this.prsOneParFunc(ValueType.bool, this.cdNot);
  };

  prsOr = (pi: PrsInfo): void => {
    this.prsTwoPlusParFunc(ValueType.bool, ValueType.bool, this.cdOr);
  };

  prsIf = (pi: PrsInfo): void => {
    this.prsFunctionStart();
    this.prsExpression(ValueType.boolNum, ',');
    if (codeDebug) {
      this.currCodeUnit.code[this.pgmCounter++] = -1;
    }
    this.currCodeUnit.code[this.pgmCounter++] = this.cdIfNotBranch;
    const ifNotBranch = this.pgmCounter;
    this.currCodeUnit.code[this.pgmCounter++] = 0;
    const beforeCounter = this.pgmCounter;
    const eReturn = this.prsExpression(ValueType.undef, ',');
    if (this.pgmCounter === beforeCounter) {
      this.prsError = 'Empty expression not allowed';
      this.prsErrorPos = this.prsPos;
      throw new Error(this.prsError);
    }
    if (codeDebug) {
      this.currCodeUnit.code[this.pgmCounter++] = -1;
    }
    this.currCodeUnit.code[this.pgmCounter++] = this.cdBranch;
    const branch = this.pgmCounter;
    this.currCodeUnit.code[this.pgmCounter++] = 0;
    this.currCodeUnit.code[ifNotBranch] = this.pgmCounter - ifNotBranch - 1;
    const beforeCounter2 = this.pgmCounter;
    this.prsExpression(eReturn.valTp, ')');
    if (this.pgmCounter === beforeCounter2) {
      this.prsError = 'Empty expression not allowed';
      this.prsErrorPos = this.prsPos;
      throw new Error(this.prsError);
    }
    this.currCodeUnit.code[branch] = this.pgmCounter - branch - 1;
    this.tpStk.length -= 2;
    this.tpStk[this.tpStk.length - 1] = eReturn.valTp;
  };

  // end is either ',' or ')'
  prsColumnName = (
    end: string,
    emptyOk: boolean = false,
  ): [number, string] => {
    this.prsSkipSpaces();
    const endDblQuote = this.prsStr[this.prsPos] === '"';
    const endSglQuote = this.prsStr[this.prsPos] === `'`;
    if (endDblQuote || endSglQuote) {
      this.prsPos++;
    }
    const startPos = this.prsPos;
    let name;
    for (;;) {
      const foundDblQuote = endDblQuote && this.prsStr[this.prsPos] === '"';
      const foundSglQuote = endSglQuote && this.prsStr[this.prsPos] === `'`;
      if (foundDblQuote || foundSglQuote) {
        name = this.prsStr.substr(startPos, this.prsPos - startPos);
        this.prsPos++;
        this.prsSkipSpaces();
        break;
      }
      if (this.prsStr[this.prsPos] === ')'
        || this.prsStr[this.prsPos] === ',') {
        if (endDblQuote) {
          this.prsError = '" expected';
          this.prsErrorPos = this.prsPos;
          throw this.prsError;
        }
        if (endSglQuote) {
          this.prsError = `' expected`;
          this.prsErrorPos = this.prsPos;
          throw this.prsError;
        }
        name = this.prsStr.substr(startPos, this.prsPos - startPos);
        name = name.trim();
        break;
      }
      this.prsPos++;
    }
    const endChar = this.prsStr[this.prsPos];
    if (endChar !== end[0] && endChar !== end[1]) {
      this.prsError = `'${end}' expected`;
      this.prsErrorPos = this.prsPos;
      throw this.prsError;
    }
    this.prsPos++;
    const ix = this.dataEng.findColumn(name);
    if (ix === 0 && !emptyOk) {
      this.prsError = 'column name not recognized';
      this.prsErrorPos = this.prsPos - 1;
      throw this.prsError;
    }
    return [ix, endChar];
  };

  chkForCircular = (ix: number): void => {
    if (this.dataEng.addComputedColumnDependency(
      this.currCodeUnit.ix, ix)) {
      this.prsError = 'Circular Reference Error';
      this.prsErrorPos = this.prsPos;
      throw this.prsError;
    }
  };

  prsColumn = (pi: PrsInfo): ValueType => {
    this.prsFunctionStart();
    const [ix, ] = this.prsColumnName(')');
    if (ix > 0) {
      this.dataEng.addComputedColumnDependency(this.currCodeUnit.ix,  - ix);
      this.compile(this.cdColumn, ix - 1);
    } else {
      // '#' has been removed from column list. Use rowNm
      // if (ix === -1000) {
      //   this.compile(this.cdRowLabel);
      //   this.tpStk.push(ValueType.num);
      //   return ValueType.num;
      // }
      this.chkForCircular(-ix - 1);
      this.compile(this.cdComputed, -ix - 1);
    }
    const tp = this.dataEng.getColumnType(ix);
    this.tpStk.push(tp);
    return tp;
  };

  prsRowNm = (): ValueType => {
    this.compile(this.cdRowNm);
    this.tpStk.push(ValueType.num);
    return ValueType.num;
  };

  prsGroupBy = (pi: PrsInfo): ValueType => {
    this.prsFunctionStart();
    // Get columns
    const cols = [];
    for (;;) {
      const [ix, endChar] = this.prsColumnName(',)', true);
      // TODO: if ix points to a aggregatable column, find primitive
      // and substitute.
      if (ix !== 0) {
        cols.push(ix);
      }
      if (endChar === ')') {
        break;
      }
    }
    this.compile(this.cdGroupBy, cols.length, cols.length + 1);
    for (const valIx of cols) {
      const ix = valIx > 0 ? valIx - 1 : valIx;
      this.currCodeUnit.code[this.pgmCounter++] = ix;
    }
    this.tpStk.push(ValueType.num);
    return ValueType.num;
  };

  prsBreakTotal = (execCd: number): BreakTotalReturn => {
    this.prsFunctionStart();
    // Get value column
    const [valIx, ] = this.prsColumnName(')');
    if (valIx === -1000) {
      this.prsError = '# cannot be totaled';
      this.prsErrorPos = this.prsPos;
      throw this.prsError;
    }
    const tp = this.dataEng.getColumnType(valIx);
    if (tp !== ValueType.num) {
      this.prsError = 'value column must be numeric';
      this.prsErrorPos = this.prsPos;
      throw this.prsError;
    }
    if (valIx > 0) {
      this.compile(execCd, valIx - 1, 2);
    } else {
      this.compile(execCd, valIx);
      this.chkForCircular( -valIx - 1);
    }
    this.tpStk.push(tp);
    return { tp, valIx };
  };

  prsBreakCume = (): ValueType => {
    const btr = this.prsBreakTotal(this.cdBreakCume);
    if (!singleAgg) {
      this.markAggSupport(btr.valIx, AggCode.breakCume);
    }
    return btr.tp;
  };

  prsAgg = (): ValueType => {
    const btr = this.prsBreakTotal(this.cdAgg);
    if (!singleAgg) {
      const support = this.verifyAggSupport(btr.valIx, AggCode.breakCume);
      console.log('PRSAGG valIx', btr.valIx, 'sup', support);
      // Replace value column with cume value computed column
      this.currCodeUnit.code[this.pgmCounter - 1] = support.ix;
      this.currCodeUnit.reversePass = true;
      this.currCodeUnit.aggType = AggType.agg;
    } else {

    }
    return btr.tp;
  };

  // Execution utilities

  opStr = (op: OpStkCell): string =>
    `[${op.op}|${op.prec}]`;

  typeStr = (type: ValueType): string => {
    let typeStr = '';
    switch (type) {
      case ValueType.num:
        typeStr = 'Number';
        break;
      case ValueType.str:
        typeStr = `String`;
        break;
      case ValueType.bool:
        typeStr = `Boolean`;
        break;
      case ValueType.boolNum:
        typeStr = `Boolean or Number`;
        break;
      default:
        typeStr = 'Undefined';
    }
    return typeStr;
  };

  valueStr = (value: Value): string => {
    let valueStr = '';
    switch (value.type) {
      case ValueType.num:
        valueStr = `(num:${value.val as number})`;
        break;
      case ValueType.str:
        valueStr = `(str:'${value.val as string}')`;
        break;
      case ValueType.bool:
        valueStr = `(bool:${value.val as boolean})`;
        break;
      default:
        valueStr = '(undef)';
    }
    return valueStr;
  };

  opStkStr = (): string => {
    let str = ': ';
    for (let i = 0; i < this.opStk.length; i++) {
      if (i > 0) {
        str += ', ';
      }
      str += this.opStr(this.opStk[i]);
    }
    return str;
  };

  tpStkStr = (): string => {
    let str = ': ';
    for (let i = 0; i < this.tpStk.length; i++) {
      if (i > 0) {
        str += ', ';
      }
      str += this.typeStr(this.tpStk[i]);
    }
    return str;
  };

  stkStr = (): string => {
    let str = ': ';
    for (let i = 0; i < this.stk.length; i++) {
      if (i > 0) {
        str += ', ';
      }
      str += this.valueStr(this.stk[i]);
    }
    return str;
  };

  dbgPrint = (op: string, val: any = undefined) => {
    if (this.currRowNm > 0) {
      return;
    }
    let valStr = val ? `:${val}` : '';
    const addr = this.pgmCounter + (val ? -1 : 0);
    valStr = `${(addr).toString().padStart(3, ' ')
      }: <${op}${valStr}>`;
    valStr = valStr.padEnd(25, ' ') + this.stkStr();
    console.log(valStr);
  };

  // Execute functions

  noop = (): void => {
    if (codeDebug) {
      this.dbgPrint('noop');
    }
  };

  // Constants

  zero = (): void => {
    this.stk.push({ type: ValueType.num, val: 0 });
    if (codeDebug) {
      this.dbgPrint('zero');
    }
  };

  one = (): void => {
    this.stk.push({ type: ValueType.num, val: 1 });
    if (codeDebug) {
      this.dbgPrint('one');
    }
  };

  two = (): void => {
    this.stk.push({ type: ValueType.num, val: 2 });
    if (codeDebug) {
      this.dbgPrint('two');
    }
  };

  negOne = (): void => {
    this.stk.push({ type: ValueType.num, val: -1 });
    if (codeDebug) {
      this.dbgPrint('one');
    }
  };

  false = (): void => {
    this.stk.push({ type: ValueType.bool, val: false });
    if (codeDebug) {
      this.dbgPrint('false');
    }
  };

  true = (): void => {
    this.stk.push({ type: ValueType.bool, val: true });
    if (codeDebug) {
      this.dbgPrint('true');
    }
  };

  emptyStr = (): void => {
    this.stk.push({ type: ValueType.str, val: '' });
    if (codeDebug) {
      this.dbgPrint('emptyStr');
    }
  };

  // Logical operators

  boolEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const value1 = this.stk[tos].val as boolean;
    this.stk[tos].val = value1 === value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('boolEq');
    }
  };

  boolNotEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const value1 = this.stk[tos].val as boolean;
    this.stk[tos].val = value1 !== value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('boolNotEq');
    }
  };

  boolGreater = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const value1 = this.stk[tos].val as boolean;
    this.stk[tos].val = value1 > value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('boolGreater');
    }
  };

  boolGreaterEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const value1 = this.stk[tos].val as boolean;
    this.stk[tos].val = value1 >= value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('boolGreaterEq');
    }
  };

  boolLess = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const value1 = this.stk[tos].val as boolean;
    this.stk[tos].val = value1 < value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('boolLess');
    }
  };

  boolLessEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const value1 = this.stk[tos].val as boolean;
    this.stk[tos].val = value1 <= value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('boolLessEq');
    }
  };

  numEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const value1 = this.stk[tos].val as number;
    this.stk[tos].val = value1 === value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('numEq');
    }
  };

  numNotEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const value1 = this.stk[tos].val as number;
    this.stk[tos].val = value1 !== value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('numNotEq');
    }
  };

  numGreater = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const value1 = this.stk[tos].val as number;
    this.stk[tos].val = value1 > value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('numGreater');
    }
  };

  numGreaterEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const value1 = this.stk[tos].val as number;
    this.stk[tos].val = value1 >= value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('numGreaterEq');
    }
  };

  numLess = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const value1 = this.stk[tos].val as number;
    this.stk[tos].val = value1 < value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('numLess');
    }
  };

  numLessEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const value1 = this.stk[tos].val as number;
    this.stk[tos].val = value1 <= value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('numLessEq');
    }
  };

  strEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as string;
    this.stk.length--;
    const value1 = this.stk[tos].val as string;
    this.stk[tos].val = value1 === value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('strEq');
    }
  };

  strNotEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as string;
    this.stk.length--;
    const value1 = this.stk[tos].val as string;
    this.stk[tos].val = value1 !== value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('strNotEq');
    }
  };

  strGreater = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as string;
    this.stk.length--;
    const value1 = this.stk[tos].val as string;
    this.stk[tos].val = value1 > value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('strGreater');
    }
  };

  strGreaterEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as string;
    this.stk.length--;
    const value1 = this.stk[tos].val as string;
    this.stk[tos].val = value1 >= value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('strGreaterEq');
    }
  };

  strLess = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as string;
    this.stk.length--;
    const value1 = this.stk[tos].val as string;
    this.stk[tos].val = value1 < value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('strLess');
    }
  };

  strLessEq = (): void => {
    const tos = this.stk.length - 2;
    const value2 = this.stk[tos + 1].val as string;
    this.stk.length--;
    const value1 = this.stk[tos].val as string;
    this.stk[tos].val = value1 <= value2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('strLessEq');
    }
  };

  // Number arithmetic operators

  numAdd = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = val1 + val2;
    if (codeDebug) {
      this.dbgPrint('numAdd');
    }
  };

  numSub = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = val1 - val2;
    if (codeDebug) {
      this.dbgPrint('numSub');
    }
  };

  numMul = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = val1 * val2;
    if (codeDebug) {
      this.dbgPrint('numMul');
    }
  };

  numDiv = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    if (val2 === 0) {
      throw new Error('division by 0');
    }
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = val1 / val2;
    if (codeDebug) {
      this.dbgPrint('numDiv');
    }
  };

  numExp = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = val1 ** val2;
    if (codeDebug) {
      this.dbgPrint('numExp');
    }
  };

  numNeg = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as number;
    this.stk[tos].val = -val;
    if (codeDebug) {
      this.dbgPrint('numNeg');
    }
  };

  // Number functions

  mod = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    if (val2 === 0) {
      throw new Error('division by 0');
    }
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = val1 % val2;
    if (codeDebug) {
      this.dbgPrint('mod');
    }
  };

  quotient = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    if (val2 === 0) {
      throw new Error('division by 0');
    }
    this.stk.length--;
    const val1 = this.stk[tos].val as number;
    this.stk[tos].val = Math.floor(val1 / val2);
    if (codeDebug) {
      this.dbgPrint('quotient');
    }
  };

  round = (): void => {
    const tos = this.stk.length - 2;
    const nmDigits = this.stk[tos + 1].val as number;
    const mult = 10 ** nmDigits;
    this.stk.length--;
    const val = this.stk[tos].val as number;
    this.stk[tos].val = Math.round(val * mult) / mult;
    if (codeDebug) {
      this.dbgPrint('round');
    }
  };

  ceiling = (): void => {
    const tos = this.stk.length - 2;
    const factor = 1 / (this.stk[tos + 1].val as number);
    const val = this.stk[tos].val as number;
    this.stk.length--;
    this.stk[tos].val = Math.ceil(val * factor) / factor;
    if (codeDebug) {
      this.dbgPrint('ceiling');
    }
  };

  floor = (): void => {
    const tos = this.stk.length - 2;
    const factor = 1 / (this.stk[tos + 1].val as number);
    const val = this.stk[tos].val as number;
    this.stk.length--;
    this.stk[tos].val = Math.floor(val * factor) / factor;
    if (codeDebug) {
      this.dbgPrint('floor');
    }
  };

  // String functions

  code = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as string;
    this.stk[tos].val = val.charCodeAt(0);
    if (codeDebug) {
      this.dbgPrint('code');
    }
  };

  char = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as number;
    this.stk[tos].val = String.fromCharCode(val);
    if (codeDebug) {
      this.dbgPrint('char');
    }
  };

  len = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as string;
    this.stk[tos].val = val.length;
    if (codeDebug) {
      this.dbgPrint('len');
    }
  };

  text = (): void => {
    this.pgmCounter += 1;
    const formatIx = this.currCodeUnit.code[this.pgmCounter] as number;
    const tos = this.stk.length - 2;
    const type = this.stk[tos].type;
    if (this.currCodeUnit.formats.length <= formatIx ) {
      // parse format string
      if (type === ValueType.num) {
        const str = this.stk[tos + 1].val as string;
        const hasDollar = str.indexOf('$') > -1;
        const hasCommas = str.indexOf(',') > -1;
        let decimalsZeroCount = 0;
        let decimalsPoundCount = 0;
        const decimalPoint = str.indexOf('.');
        if (decimalPoint > -1) {
          for (let i = decimalPoint + 1; i < str.length; i++) {
            decimalsZeroCount += (str[i] === '0') ? 1 : 0;
            decimalsPoundCount += (str[i] === '#') ? 1 : 0;
            if (str[i] !== '0' && str[i] !== '#') {
              break;
            }
          }
        }
        let zeroCount = 0;
        const decimalsCount = decimalsZeroCount + decimalsPoundCount;
        const end = decimalPoint > -1 ? decimalPoint : str.length;
        for (let i = end; 0 < i--;) {
          if (str[i] === '0') {
            zeroCount++;
          } else if (str[i] !== ',') {
            break;
          }
        }
        this.currCodeUnit.formats.push(new FormatInfo(
          hasDollar ? '$' : '',
          hasCommas,
          decimalPoint,
          decimalsZeroCount,
          decimalsPoundCount,
          zeroCount,
        ));
        console.log(`Saving format: currencyChr=${
          hasDollar ? '$' : ''
        } hasCommas=${
          hasCommas
        } decimalPoint=${
          decimalPoint
        } decimalsZeroCount=${
          decimalsZeroCount
        } decimalsPoundCount=${
          decimalsPoundCount
        } zeroCount=${
          zeroCount
        }`);
      }
    }
    else { console.log('skipping format parsing'); }
    // execute
    const format = this.currCodeUnit.formats[formatIx];
    if (type === ValueType.num) {
      const num = this.stk[tos].val as number;
      let numStr = '';
      const decimalCount = format.decimalsZeroCount +
        format.decimalsPoundCount;
      numStr = num.toFixed(decimalCount);
      const rightLen = decimalCount === 0 ? decimalCount : decimalCount + 1;
      let leftLen = numStr.length - rightLen;
      const padLen = format.zeroCount - leftLen;
      if (padLen > 0) {
        numStr = numStr.padStart(numStr.length + padLen, '0');
        leftLen = format.zeroCount;
      }
      let numOutStr = format.currencySymbol;
      if (format.hasCommas) {
        const commaCount = (leftLen - 1) / 3;
        const digits = (commaCount - Math.floor(commaCount)) * 3 + 1.5;
        numOutStr += numStr.slice(0, digits);
        for (let i = Math.floor(digits); i + 3 <= leftLen; i += 3) {
          numOutStr += ',' + numStr.slice(i, i + 3);
        }
        numOutStr += numStr.substr(-rightLen, rightLen);
      } else {
        numOutStr += numStr;
      }
      this.stk[tos].val = numOutStr;
      this.stk[tos].type = ValueType.str;
    } else if (type === ValueType.bool) {
      this.stk[tos].val = (this.stk[tos].val as boolean).toString();
      this.stk[tos].type = ValueType.str;
    }
    this.stk.length--;
  };

  lower = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as string;
    this.stk[tos].val = val.toLowerCase();
    if (codeDebug) {
      this.dbgPrint('lower');
    }
  };

  upper = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as string;
    this.stk[tos].val = val.toUpperCase();
    if (codeDebug) {
      this.dbgPrint('upper');
    }
  };

  concat = (): void => {
    this.pgmCounter += 1;
    const strCount = this.currCodeUnit.code[this.pgmCounter] as number;
    let str = '';
    const base = this.stk.length - strCount;
    for (let i = 0; i < strCount; i++) {
      str += this.stk[base + i].val as string;
    }
    this.stk.length -= strCount - 1;
    this.stk[base].val = str;
    if (codeDebug) {
      this.dbgPrint('concat', strCount);
    }
  };

  left = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const val1 = this.stk[tos].val as string;
    this.stk[tos].val = val1.substr(0, val2);
    if (codeDebug) {
      this.dbgPrint('left');
    }
  };

  mid = (): void => {
    const tos = this.stk.length - 3;
    this.stk.length -= 2;
    const len = this.stk[tos + 2].val as number;
    const start = this.stk[tos + 1].val as number;
    const str = this.stk[tos].val as string;
    this.stk[tos].val = str.substr(start, len);
    if (codeDebug) {
      this.dbgPrint('mid');
    }
  };

  right = (): void => {
    const tos = this.stk.length - 2;
    const val2 = this.stk[tos + 1].val as number;
    this.stk.length--;
    const val1 = this.stk[tos].val as string;
    this.stk[tos].val = val1.substr(0, val2);
    if (codeDebug) {
      this.dbgPrint('right');
    }
  };

  trim = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as string;
    this.stk[tos].val = val.trim();
    if (codeDebug) {
      this.dbgPrint('trim');
    }
  };

  // Locical functions

  and = (): void => {
    const tos = this.stk.length - 2;
    const val1 = this.stk[tos].val as boolean;
    this.stk.length--;
    const val2 = this.stk[tos + 1].val as boolean;
    this.stk[tos].val = val1 && val2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('and');
    }
  };

  not = (): void => {
    const tos = this.stk.length - 1;
    const val = this.stk[tos].val as boolean;
    this.stk[tos].val = !val;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('not');
    }
  };

  or = (): void => {
    const tos = this.stk.length - 2;
    const val1 = this.stk[tos + 1].val as boolean;
    this.stk.length--;
    const val2 = this.stk[tos].val as boolean;
    this.stk[tos].val = val1 || val2;
    this.stk[tos].type = ValueType.bool;
    if (codeDebug) {
      this.dbgPrint('or');
    }
  };

  // Data functions

  column = (): void => {
    this.pgmCounter += 1;
    const colNm = this.currCodeUnit.code[this.pgmCounter] as number;
    const currRowNm = this.getSortedRow(this.currRowNm);
    this.dataEng.getDataColumnValue(colNm, currRowNm, this.stk);
    if (codeDebug) {
      this.dbgPrint('column', colNm);
    }
  };

  computed = (): void => {
    this.pgmCounter += 1;
    const colNm = this.currCodeUnit.code[this.pgmCounter] as number;
    if (codeDebug) {
      this.dbgPrint('computed', colNm);
    }
    const currRowNm = this.getSortedRow(this.currRowNm);
    this.dataEng.getComputedColumnValue(colNm, currRowNm, this.stk);
  };

  rowLabel = (): void => {
    const num = this.currRowNm + 1;
    this.stk.push({ type: ValueType.num, val: num });
    if (codeDebug) {
      this.dbgPrint('rowLabel', num);
    }
  };

  rowNm = (): void => {
    const num = this.currRowNm;
    this.stk.push({ type: ValueType.num, val: num });
    if (codeDebug) {
      this.dbgPrint('rowNumber', num);
    }
  };

  // variable = (): void => {
  //   this.pgmCounter += 1;
  //   const varIx = this.currCodeUnit.code[this.pgmCounter] as number;
  //   if (codeDebug) {
  //     this.dbgPrint('variable', varIx);
  //   }
  //   this.stk.push(this.data.getVariableValue(varIx));
  // }

  // Core functions

  numLiteral = (): void => {
    this.pgmCounter += 1;
    const num = this.currCodeUnit.code[this.pgmCounter];
    this.stk.push({ type: ValueType.num, val: num });
    if (codeDebug) {
      this.dbgPrint('numLiteral', num);
    }
  };

  strLiteral = (): void => {
    this.pgmCounter += 1;
    const str = this.currCodeUnit.code[this.pgmCounter] as string;
    this.stk.push({ type: ValueType.str, val: str });
    if (codeDebug) {
      this.dbgPrint('strLiteral', str);
    }
  };

  ifNotBranch = (): void => {
    this.pgmCounter += 1;
    const offset = this.currCodeUnit.code[this.pgmCounter] as number;
    const value = this.stk.pop();
    if (codeDebug) {
      this.dbgPrint('ifNotBranch', offset);
    }
    if (value && !(value.val as boolean)) {
      this.pgmCounter += offset;
    }
  };

  branch = (): void => {
    this.pgmCounter += 1;
    const offset = this.currCodeUnit.code[this.pgmCounter] as number;
    if (codeDebug) {
      this.dbgPrint('branch', offset);
    }
    this.pgmCounter += offset;
  };

  end = (): void => {
    console.log('Program end reached');
  };

  // transformation functions

  // Used by both groupBy and agg support functions
  /* private */ isForwardBreak = (breakIx: number): boolean => {
    // Get prior break column value to stack
    if (this.currRowNm > 0) {
      const priorRowNm = this.getSortedRow(this.currRowNm - 1);
      if (breakIx < 0) {
        this.dataEng.getComputedColumnValue(
          -breakIx - 1, priorRowNm, this.stk);
      } else {
        this.dataEng.getDataColumnValue(
          breakIx, priorRowNm, this.stk);
      }
    } else {
      this.stk.push({ type: ValueType.undef, val: 0} );
    }
    // Get current break column value to stack
    const currRowNm = this.getSortedRow(this.currRowNm);
    if (breakIx < 0) {
      this.dataEng.getComputedColumnValue(
        -breakIx - 1, currRowNm, this.stk);
    } else {
      this.dataEng.getDataColumnValue(
        breakIx, currRowNm, this.stk);
    }
    const valPos = this.stk.length - 2;
    const isBreakChange = this.stk[valPos].type !== this.stk[valPos + 1].type
      || this.stk[valPos].val !== this.stk[valPos + 1].val;
    this.stk.length -= 2;
    return isBreakChange;
  };

  groupBy = (): void => {
    this.pgmCounter += 1;
    const breakCount = this.currCodeUnit.code[this.pgmCounter] as number;
    const pcAfter = this.pgmCounter + breakCount;
    let isBreak = true;
    if (breakCount > 0) {
      isBreak = false;
      for (let i = 0; i < breakCount; i++) {
        this.pgmCounter += 1;
        const breakIx = this.currCodeUnit.code[this.pgmCounter] as number;
        if (this.isForwardBreak(breakIx)) {
          this.pgmCounter = pcAfter;
          isBreak = true;
          break;
        }
      }
    }
    // Get prior value
    if (this.currRowNm > 0) {
      const priorRowNm = this.getSortedRow(this.currRowNm - 1);
      this.dataEng.getComputedColumnValue(
        this.currCodeUnit.ix, priorRowNm, this.stk);
    } else {
      this.stk.push({ type: ValueType.num, val: 0 });
      // this.stk.push({ type: ValueType.num, val: breakCount > 0 ? 0 : 1 });
    }
    if (isBreak) {
      (this.stk[this.stk.length - 1].val as number) += 1;
    }
  };

  breakCume = (): void => {
    this.pgmCounter += 1;
    const valIx = this.currCodeUnit.code[this.pgmCounter] as number;
    if (singleAgg) {
      const isBreakChange = this.isReverseBreak();
      // Get current value
      const currRowNm = this.getSortedRow(this.currRowNm);
      if (valIx < 0) {
        this.dataEng.getComputedColumnValue(
          -valIx - 1, currRowNm, this.stk);
      } else {
        this.dataEng.getDataColumnValue(
          valIx, currRowNm, this.stk);
      }
      // If not breaking, get cume
      if (!isBreakChange) {
        const nextRowNm = this.getSortedRow(this.currRowNm + 1);
        this.dataEng.getComputedColumnValue(
          this.currCodeUnit.ix, nextRowNm, this.stk);
        const valPos = this.stk.length - 2;
        (this.stk[valPos].val as number) += this.stk[valPos + 1].val as number;
        this.stk.length -= 1;
      }
    } else {
      const isBreakChange = this.isForwardBreak(-1);
      // Get current value
      const currRowNm = this.getSortedRow(this.currRowNm);
      if (valIx < 0) {
        this.dataEng.getComputedColumnValue(
          -valIx - 1, currRowNm, this.stk);
      } else {
        this.dataEng.getDataColumnValue(
          valIx, currRowNm, this.stk);
      }
      // If not breaking, get cume
      if (!isBreakChange) {
        const priorRowNm = this.getSortedRow(this.currRowNm - 1);
        this.dataEng.getComputedColumnValue(
          this.currCodeUnit.ix, priorRowNm, this.stk);
        const valPos = this.stk.length - 2;
        (this.stk[valPos].val as number) += this.stk[valPos + 1].val as number;
        this.stk.length -= 1;
      }
    }
  };

  /* private */ isReverseBreak = (): boolean => {
    // Get prior break column value to stack
    if (this.currRowNm < this.dataEng.dataRows.length - 1) {
      const nextRowNm = this.getSortedRow(this.currRowNm + 1);
      this.dataEng.getComputedColumnValue(0, nextRowNm, this.stk);
    } else {
      this.stk.push({ type: ValueType.undef, val: 0 });
    }
    // Get current break column value to stack
    const currRowNm = this.getSortedRow(this.currRowNm);
    this.dataEng.getComputedColumnValue(0, currRowNm, this.stk);
    const valPos = this.stk.length - 2;
    const isBreakChange = this.stk[valPos].type !== this.stk[valPos + 1].type
      || this.stk[valPos].val !== this.stk[valPos + 1].val;
    this.stk.length -= 2;
    return isBreakChange;
  };

  agg = (): void => {
    this.pgmCounter += 1;
    const aggValIx = this.currCodeUnit.code[this.pgmCounter] as number;
    const isBreakChange = this.isReverseBreak();
    if (isBreakChange) {
      // Get current aggregate value to stack
      const currRowNm = this.getSortedRow(this.currRowNm);
      this.dataEng.getComputedColumnValue(aggValIx, currRowNm, this.stk);
    } else {
      // If not breaking, copy next row
      const nextRowNm = this.getSortedRow(this.currRowNm + 1);
      this.dataEng.getComputedColumnValue(
        this.currCodeUnit.ix, nextRowNm, this.stk);
    }
    // console.log('SUM', this.currRowNm);
    // this.stk.push({ type: ValueType.num, val: this.currRowNm });
  };

  // Utilities

  getSortedRow = (rowNm: number): number =>
    this.dataEng.sortDataRows[rowNm];

  // Private methods


  private exec = (name: string, exec: ExecProc) => {
    this.dbgExecs.push(name);
    return this.execs.push(exec) - 1;
  };

  private compile = (
    execCd: number,
    val?: Val,
    pars?: number
  ): void => {
    const ex = this.dbgExecs[execCd];
    const parCount = pars ? Math.abs(pars) : val !== undefined ? 1 : 0;
    const dbgVal = parCount ? `-${parCount}` : '';
    if (codeDebug) {
      const valStr = val ? val.toString() : '';
      const str = `${this.pgmCounter}: Compiling [${
        dbgVal}|${ex}|${valStr}]`;
      console.log(str.padEnd(40, ' '), this.tpStkStr());
    }
    if (val !== undefined && codeDebug) {
      this.currCodeUnit.code[this.pgmCounter++] = -parCount;
    }
    this.currCodeUnit.code[this.pgmCounter++] = execCd;
    if (val !== undefined) {
      this.currCodeUnit.code[this.pgmCounter++] = val;
    }
  };

  // Searches for a computed column with the the specifiex aggCode,
  // valIx, and breakIx
  private verifyAggSupport = (
    valIx: number, aggCode: AggCode
  ): AggSupportInfo => {
    let aggIx = this.dataEng.findAggSupport(valIx, aggCode);
    let computed;
    if (aggIx === -1) {
      const valueName = valIx < 0
        ? this.dataEng.compColumnDefs[-valIx - 1].displayName
        : this.dataEng.dataColumnDefs[valIx - 1].displayName;

      // Save parse environment so another parse session can execute

      const bupOpStk = Array.from(this.opStk);
      const bupTpStk = Array.from(this.tpStk);
      const bupStk = Array.from(this.stk);
      const bupFormats = Array.from(this.currCodeUnit.formats);
      const bupFormatCount = this.currCodeUnit.formatCount;
      const bupDependOn = Array.from(this.currCodeUnit.dependentOn);
      const bupCode = Array.from(this.currCodeUnit.code);
      const bupCurrCodeUnit = this.currCodeUnit;
      const bupPgmCounter = this.pgmCounter;
      const bupPrsStr = this.prsStr;
      const bupPrsPos = this.prsPos;
      // console.log('>>>>>>>>>>>>>>>>>>>>> Adding Agg Support');

      computed = this.dataEng.addComputedColumnWithSource(
        `yyy${
          this.dataEng.compColumnDefs[this.currCodeUnit.ix].displayName}`,
        false,
        `${aggSupportCodeToStr(aggCode)}("${valueName}")`,
      );
      computed.codeUnit.aggType = AggType.support;
      if (singleAgg) {
        computed.codeUnit.reversePass = true;
      }

      // console.log('<<<<<<<<<<<<<<<<<<<<< Done Adding Agg Support');
      this.prsPos = bupPrsPos;
      this.prsStr = bupPrsStr;
      this.pgmCounter = bupPgmCounter;
      this.currCodeUnit = bupCurrCodeUnit;
      this.currCodeUnit.code = Array.from(bupCode);
      this.currCodeUnit.dependentOn = Array.from(bupDependOn);
      this.currCodeUnit.formatCount = bupFormatCount;
      this.currCodeUnit.formats = Array.from(bupFormats);
      this.stk = Array.from(bupStk);
      this.tpStk = Array.from(bupTpStk);
      this.opStk = Array.from(bupOpStk);

      aggIx = this.dataEng.findAggSupport(valIx, aggCode);
    }
    const depIx = this.dataEng.aggSupport[aggIx].ix;
    this.currCodeUnit.aggSupportIx = aggIx;
    this.dataEng.addComputedColumnDependency(this.currCodeUnit.ix, depIx);
    // console.log('>>>>>>>>>>>>>>>>>>>>> Done Adding Agg Support');
    return this.dataEng.aggSupport[aggIx];
  };

  private markAggSupport = (
    valIx: number,
    aggCode: AggCode,
  ): AggSupportInfo => {
    let aggIx = this.dataEng.findAggSupport(valIx, aggCode);
    if (aggIx === -1) {
      aggIx = this.dataEng.addAggSupport(valIx, aggCode, this.currCodeUnit.ix);
    }
    console.log('markAggSupport ix', aggIx, this.dataEng.aggSupport[aggIx]);
    return this.dataEng.aggSupport[aggIx];
  };

  // Function parse utilities

  private prsOneParFunc = (valTp: ValueType, execCd: number): void => {
    this.prsFunctionStart();
    this.prsExpression(valTp, ')');
    this.compile(execCd);
  };

  private prsTwoParFunc = (
    valTp1: ValueType, valTp2: ValueType, execCd: number): void => {
    this.prsFunctionStart();
    this.prsExpression(valTp1, ',');
    this.prsExpression(valTp2, ')');
    this.compile(execCd);
  };

  private prsOnePlusOneParFunc = (
    valTp: ValueType, optTp: ValueType,
    defaultVal: Val, execCd: number): void => {
    this.prsFunctionStart();
    const eReturn = this.prsExpression(valTp, ',)');
    if (eReturn.endStr === ',') {
      this.prsExpression(optTp, ')');
    } else {
      if (optTp === ValueType.num && defaultVal === 1) {
        this.compile(this.cdOne);
      } else {
        this.prsError = 'Default values not implemented';
        this.prsErrorPos = this.prsPos;
        throw new Error(this.prsError);
      }
    }
    this.compile(execCd);
  };

  private prsTwoPlusParFunc = (
    valTp1: ValueType, valTpN: ValueType, execCd: number) => {
    this.prsFunctionStart();
    this.prsExpression(valTp1, ',');
    let eReturn = this.prsExpression(valTpN, ',)');
    this.tpStk.length--;
    this.compile(execCd);
    while (eReturn.endStr === ',') {
      eReturn = this.prsExpression(valTpN, ',)');
      this.compile(execCd);
    }
  };

}
