class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // when a new object is created, this function call will not appear in the stack trace and not pollute it
    //Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
