export class DockerError extends Error {
  private code: number;
  
  constructor(message: string, code: number) {
    super(message);
    this.name = 'DockerError';
    this.code = code;
  }

  public exitCode(): number {
    return this.code;
  }
}
