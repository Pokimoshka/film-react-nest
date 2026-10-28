import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Film } from './film.entity';

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  filmId: string;

  @ManyToOne(() => Film, (film) => film.schedule, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'filmId' })
  film: Film;

  @Column({ type: 'text' })
  daytime: string;

  @Column({ type: 'int' })
  hall: number;

  @Column({ type: 'int' })
  rows: number;

  @Column({ type: 'int' })
  seats: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'text', array: true, default: () => "'{}'::text[]" })
  taken: string[];
}
