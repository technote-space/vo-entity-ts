import type { ValidationErrors } from '../exceptions/validation.js';
import { ValidationException } from '../exceptions/validation.js';
import type { ValidationError } from '../valueObject/index.js';
import { ValueObject } from '../valueObject/index.js';
import { Collection } from './collection.js';

type EntityPropType =
  // biome-ignore lint/suspicious/noExplicitAny:
  | ValueObject<any, any>
  | Entity
  // biome-ignore lint/suspicious/noExplicitAny:
  | Collection<any>
  | undefined;
type EntityPropsTypes = { [key: string]: Readonly<EntityPropType> };
type InferProps<Instance extends Entity> = Instance extends Entity<infer Props>
  ? Props
  : never;
type EntityPropsType<Props extends EntityPropsTypes> = {
  [key in keyof Props]: Props[key] extends Entity
    ? InferProps<Props[key]>
    : Props[key] extends Collection<infer E>
      ? InferProps<E>[]
      : Props[key];
};
type EntityObjectType<E extends Entity> = E extends Entity<infer Props>
  ? {
      // biome-ignore lint/suspicious/noExplicitAny:
      [K in keyof Props]: Props[K] extends ValueObject<any, any>
        ? Props[K]['objectValue']
        : Props[K] extends Entity
          ? EntityObjectType<Props[K]>
          : // biome-ignore lint/suspicious/noExplicitAny:
            Props[K] extends Collection<any>
            ? EntityObjectType<Props[K][number]>[]
            : undefined;
    }
  : never;
export type EntityInstanceType<E extends Entity> = E & InferProps<E>;

// biome-ignore lint/suspicious/noExplicitAny:
export abstract class Entity<Props extends EntityPropsTypes = any> {
  protected constructor(protected readonly props: Props) {
    Object.freeze(this.props);

    // biome-ignore lint/correctness/noConstructorReturn:
    return new Proxy(this, {
      get(target, prop) {
        // Handle property access for props
        if (typeof prop === 'string' && prop in target.props) {
          return target.get(prop as keyof Props);
        }

        return Reflect.get(target, prop);
      },
    });
  }

  public get<Key extends keyof Props>(key: Key): Props[Key] {
    return this.props[key];
  }

  protected static _create<Instance extends Entity>(
    props: InferProps<Instance>,
  ): EntityInstanceType<Instance> {
    // biome-ignore lint/complexity/noThisInStatic:
    const instance = Reflect.construct(this, [props]) as Instance;
    instance.validate();
    return instance as EntityInstanceType<Instance>;
  }

  protected static _reconstruct<Instance extends Entity>(
    props: InferProps<Instance>,
  ): EntityInstanceType<Instance> {
    // biome-ignore lint/complexity/noThisInStatic:
    return Reflect.construct(this, [props]) as EntityInstanceType<Instance>;
  }

  protected static _update<Instance extends Entity>(
    target: Entity<InferProps<Instance>>,
    props: Partial<InferProps<Instance>>,
  ): EntityInstanceType<Instance> {
    // biome-ignore lint/complexity/noThisInStatic:
    const instance = Reflect.construct(this, [
      { ...target.props, ...props },
    ]) as Instance;
    instance.validate(target);
    return instance as EntityInstanceType<Instance>;
  }

  public abstract equals(other: Entity<Props>): boolean;

  public getErrors(prev?: Entity<Props>): ValidationErrors {
    return Object.keys(this.props).reduce((acc, key) => {
      const member = this.props[key];
      const prevValue = prev
        ? // biome-ignore lint/suspicious/noExplicitAny:
          ((prev[key as keyof Entity] as any) ?? undefined)
        : undefined;

      if (member && member instanceof Collection) {
        const errors: ValidationErrors | undefined =
          member.getErrors(prevValue);
        if (errors) {
          return Object.entries(errors).reduce((acc, [key, value]) => {
            acc[key] = [...new Set([...(acc[key] ?? []), ...value])];
            return acc;
          }, acc);
        }
      }

      if (member && member instanceof Entity) {
        const name = key.replace(/^_/, '');
        const errors: ValidationErrors = member.getErrors(prevValue);
        return Object.entries(errors).reduce((acc, [key, value]) => {
          acc[`${name}.${key}`] = [
            ...new Set([...(acc[`${name}.${key}`] ?? []), ...value]),
          ];
          return acc;
        }, acc);
      }

      if (member && member instanceof ValueObject) {
        const name = key.replace(/^_/, '');
        const errors: ValidationError[] | undefined = member.getErrors(
          name,
          prevValue,
        );
        if (errors?.length) {
          return errors.reduce((acc, error) => {
            acc[error.name] = [
              ...new Set([...(acc[error.name] ?? []), error.error]),
            ];
            return acc;
          }, acc);
        }
      }

      return acc;
    }, {} as ValidationErrors);
  }

  // biome-ignore lint/suspicious/noConfusingVoidType:
  private validate(prev?: Entity<Props>): void | never {
    const errors = this.getErrors(prev);
    if (Object.keys(errors).length) {
      throw new ValidationException(errors);
    }
  }

  public getProps(): EntityPropsType<Props> {
    return Object.fromEntries(
      Object.entries(this.props).map(([key, value]) => {
        if (value instanceof Collection) {
          return [key, value.map((v) => v.getProps())];
        }

        if (value instanceof Entity) {
          return [key, value.getProps()];
        }

        return [key, value];
      }),
    ) as EntityPropsType<Props>;
  }

  public getObject(): EntityObjectType<Entity<Props>> {
    return Object.fromEntries(
      Object.entries(this.props).map(([key, value]) => {
        if (value instanceof Collection) {
          return [key, value.map((v) => v.getObject())];
        }

        if (value instanceof Entity) {
          return [key, value.getObject()];
        }

        if (value instanceof ValueObject) {
          return [key, value.objectValue];
        }

        return [key, undefined];
      }),
    ) as EntityObjectType<Entity<Props>>;
  }
}
