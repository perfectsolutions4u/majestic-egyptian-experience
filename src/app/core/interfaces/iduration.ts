import { Itour } from './itour';

export interface IDuration {
  id: number;
  slug: string;
  title: string;
  tours_count: number;
  tours: Itour[];
}
