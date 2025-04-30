import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Metric } from "./metric.entity";

@Entity("metric_aggregations")
export class MetricAggregation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Metric)
  @JoinColumn({ name: "metric_id" })
  metric: Metric;

  @Column()
  metricId: string;

  @Column("timestamp")
  startTime: Date;

  @Column("timestamp")
  endTime: Date;

  @Column()
  interval: string;

  @Column("float")
  min: number;

  @Column("float")
  max: number;

  @Column("float")
  avg: number;

  @Column("float")
  sum: number;

  @Column("int")
  count: number;

  @Column("jsonb", { nullable: true })
  tags: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
