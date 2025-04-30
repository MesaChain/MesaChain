import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Metric } from "./metric.entity";

@Entity("time_series_data")
export class TimeSeriesData {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Metric)
  @JoinColumn({ name: "metric_id" })
  metric: Metric;

  @Column()
  metricId: string;

  @Column("timestamp")
  timestamp: Date;

  @Column("float")
  value: number;

  @Column("jsonb", { nullable: true })
  tags: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
