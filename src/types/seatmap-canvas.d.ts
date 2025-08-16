declare module "@alisaitteke/seatmap-canvas" {
  export interface SeatConfig {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    status: "available" | "selected" | "occupied" | "unavailable";
    price?: number;
    class?: string;
  }

  export interface SeatmapConfig {
    map?: {
      rows?: number;
      columns?: number;
      indexerColumns?: {
        visible: boolean;
        label: (index: number) => string;
      };
      indexerRows?: {
        visible: boolean;
        label: (index: number) => string;
      };
    };
    seat?: {
      width?: number;
      height?: number;
      margin?: number;
      colors?: {
        available?: string;
        selected?: string;
        occupied?: string;
        unavailable?: string;
      };
    };
    style?: {
      width?: number;
      height?: number;
    };
  }

  export class Seatmap {
    constructor(container: HTMLElement);
    config(config: SeatmapConfig): void;
    addSeats(seats: SeatConfig[]): void;
    onClick(callback: (seat: SeatConfig) => void): void;
    draw(): void;
    destroy?(): void;
  }
}
