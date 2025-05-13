export class Pagination {
  private readonly _skip: number = 0;
  private readonly _take: number = 10;
  constructor(skip: string | number, take: string | number) {
    this._skip = Number(skip ?? 0);
    this._take = Number(take ?? 10);
  }

  public get skip(): number {
    return this._skip ?? 0;
  }

  public get take(): number {
    return this._take ?? 10;
  }
}
