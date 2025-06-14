import type { ValidationErrors } from '../exceptions/validation.js';
import { ValidationException } from '../exceptions/validation.js';
import { Collection } from '../valueObject/collection.js';
import type { ValidationError } from '../valueObject/index.js';
import { ValueObject } from '../valueObject/index.js';

type EntityPropType =
  // biome-ignore lint/suspicious/noExplicitAny:
  ValueObject<any, any> | Collection<ValueObject<any, any>> | undefined;
type EntityPropsType = { [key: string]: Readonly<EntityPropType> };
type InferProps<Instance extends Entity> = Instance extends Entity<infer Props>
  ? Props
  : never;
type EntityProps<Props extends EntityPropsType> = {
  [key in keyof Props]: Props[key] extends Collection<infer V>
    ? V[]
    : Props[key];
};
type EntityObject<E extends Entity> = E extends Entity<infer Props>
  ? {
      // biome-ignore lint/suspicious/noExplicitAny:
      [K in keyof Props]: Props[K] extends ValueObject<any, any>
        ? Props[K]['objectValue']
        : Props[K] extends Collection<infer V>
          ? V['objectValue'][]
          : undefined;
    }
  : never;

// biome-ignore lint/suspicious/noExplicitAny:
export abstract class Entity<Props extends EntityPropsType = any> {
  protected constructor(private readonly props: Props) {
    Object.freeze(this.props);
  }

  public get<Key extends keyof Props>(key: Key): Props[Key] {
    return this.props[key];
  }

  protected static _create<Instance extends Entity>(
    props: InferProps<Instance>,
  ): Instance {
    // biome-ignore lint/complexity/noThisInStatic:
    const instance = Reflect.construct(this, [props]) as Instance;
    instance.validate();
    return instance;
  }

  protected static _reconstruct<Instance extends Entity>(
    props: InferProps<Instance>,
  ): Instance {
    // biome-ignore lint/complexity/noThisInStatic:
    return Reflect.construct(this, [props]) as Instance;
  }

  protected static _update<Instance extends Entity>(
    target: Entity<InferProps<Instance>>,
    props: Partial<InferProps<Instance>>,
  ): Instance {
    // biome-ignore lint/complexity/noThisInStatic:
    const instance = Reflect.construct(this, [
      { ...target.props, ...props },
    ]) as Instance;
    instance.validate(target, Object.keys(props));
    return instance;
  }

  public abstract equals(other: Entity<Props>): boolean;

  public getErrors(
    prev?: Entity<Props>,
    targetKeys?: (keyof Props)[],
  ): ValidationErrors {
    return Object.keys(this.props).reduce((acc, key) => {
      const member = this.props[key];
      const prevValue: typeof member | undefined =
        prev && targetKeys?.includes(key)
          ? // biome-ignore lint/suspicious/noExplicitAny:
            ((prev.props[key as keyof Entity] as any) ?? undefined)
          : undefined;

      if (member && member instanceof Collection) {
        const name = key.replace(/^_/, '');
        const errors: ValidationError[] = member
          .map((v, index) =>
            v.getErrors(
              `${name}[${index}]`,
              // biome-ignore lint/suspicious/noExplicitAny:
              (prevValue as Collection<ValueObject<any, any>>)?.at(index),
            ),
          )
          .filter((e): e is ValidationError[] => !!e)
          .flat();
        if (errors.length) {
          return errors.reduce((acc, error) => {
            acc[error.name] = [
              ...new Set([...(acc[error.name] ?? []), error.error]),
            ];
            return acc;
          }, acc);
        }
      }

      if (member && member instanceof ValueObject) {
        const name = key.replace(/^_/, '');
        const errors: ValidationError[] | undefined = member.getErrors(
          name,
          prevValue as typeof member,
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

  private validate(
    prev?: Entity<Props>,
    targetKeys?: (keyof Props)[],
    // biome-ignore lint/suspicious/noConfusingVoidType:
  ): void | never {
    const errors = this.getErrors(prev, targetKeys);
    if (Object.keys(errors).length) {
      throw new ValidationException(errors);
    }
  }

  public getProps(): EntityProps<Props> {
    return Object.fromEntries(
      Object.entries(this.props).map(([key, value]) => {
        if (value instanceof Collection) {
          // biome-ignore lint/suspicious/noExplicitAny:
          return [key, value as Collection<ValueObject<any, any>>];
        }

        return [key, value];
      }),
    ) as EntityProps<Props>;
  }

  public getObject(): EntityObject<Entity<Props>> {
    return Object.fromEntries(
      Object.entries(this.props).map(([key, value]) => {
        if (value instanceof Collection) {
          return [
            key,
            // biome-ignore lint/suspicious/noExplicitAny:
            (value as Collection<ValueObject<any, any>>).map(
              (v) => v.objectValue,
            ),
          ];
        }

        if (value instanceof ValueObject) {
          return [key, value.objectValue];
        }

        return [key, undefined];
      }),
    ) as EntityObject<Entity<Props>>;
  }
}
