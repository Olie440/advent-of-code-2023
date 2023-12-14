export class CyclicalResultSet<T> {
  private loopOffset: number | null = null;
  private results: string[] = [];

  public isCyclical(): boolean {
    return this.loopOffset !== null;
  }

  public add(result: T): void {
    const resultJson = JSON.stringify(result);
    const resultIndex = this.results.indexOf(resultJson);

    if (resultIndex !== -1) {
      this.loopOffset = resultIndex;
    } else {
      this.results.push(resultJson);
    }
  }

  public get(index: number): T {
    if (index < this.results.length) {
      return JSON.parse(this.results[index]);
    }

    if (this.loopOffset === null) {
      throw new Error("Loop not detected yet");
    }

    const loopSize = this.results.length - this.loopOffset;
    const loopedIndex = (index - this.loopOffset) % loopSize;
    const actualIndex = this.loopOffset + loopedIndex;

    return JSON.parse(this.results[actualIndex]);
  }
}
