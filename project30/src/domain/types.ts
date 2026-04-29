export type AccountId = string;
export type TransactionId = string;
export type EventId = string;
export type Version = number;
export type Timestamp = number;
export type Money = number;

export interface DomainEvent {
  readonly eventId: EventId;
  readonly aggregateId: AccountId;
  readonly aggregateType: 'Account';
  readonly eventType: string;
  readonly version: Version;
  readonly timestamp: Timestamp;
  readonly payload: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}

export interface Snapshot<TState> {
  readonly aggregateId: AccountId;
  readonly aggregateType: 'Account';
  readonly version: Version;
  readonly state: TState;
  readonly timestamp: Timestamp;
}

export interface Command {
  readonly commandType: string;
  readonly aggregateId: AccountId;
  readonly expectedVersion?: Version;
  readonly metadata?: Record<string, unknown>;
}

export interface CommandValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export class CommandValidationException extends Error {
  constructor(
    public readonly errors: CommandValidationError[],
    message?: string
  ) {
    super(message || 'Command validation failed');
    this.name = 'CommandValidationException';
  }
}

export class OptimisticConcurrencyException extends Error {
  constructor(
    public readonly aggregateId: AccountId,
    public readonly expectedVersion: Version,
    public readonly actualVersion: Version,
    message?: string
  ) {
    super(
      message ||
        `Optimistic concurrency error for aggregate ${aggregateId}: expected version ${expectedVersion}, actual ${actualVersion}`
    );
    this.name = 'OptimisticConcurrencyException';
  }
}

export class AggregateNotFoundException extends Error {
  constructor(public readonly aggregateId: AccountId, message?: string) {
    super(message || `Aggregate ${aggregateId} not found`);
    this.name = 'AggregateNotFoundException';
  }
}

export class EventOutOfOrderException extends Error {
  constructor(
    public readonly aggregateId: AccountId,
    public readonly eventVersion: Version,
    public readonly currentVersion: Version,
    message?: string
  ) {
    super(
      message ||
        `Event out of order for aggregate ${aggregateId}: event version ${eventVersion} is not consecutive to current version ${currentVersion}`
    );
    this.name = 'EventOutOfOrderException';
  }
}
