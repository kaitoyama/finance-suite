export class BusinessRuleException extends Error {
  public static readonly DEBIT_CREDIT_MISMATCH = "DEBIT_CREDIT_MISMATCH";
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    // It's good practice to set the prototype explicitly when extending built-in classes like Error.
    Object.setPrototypeOf(this, BusinessRuleException.prototype);
  }
}
