import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity({ name: 'films' })
export class Film {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  director: string;

  @Column({ type: 'text', array: true, default: () => "'{}'::text[]" })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  cover: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  about: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true,
    eager: false,
  })
  schedule: Schedule[];
}
