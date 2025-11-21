import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Country } from '../../countries/entities/country.entity';

@Entity('travel_plans')
export class TravelPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 3 })
  countryCode: string;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryCode', referencedColumnName: 'code' })
  country: Country;

  @Column()
  title: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}