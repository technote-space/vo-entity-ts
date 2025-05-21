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
type EntityTypes = { [key: string]: Readonly<EntityPropType> };
type InferProps<Instance extends Entity> = Instance extends Entity<infer Props>
  ? Props
  : never;

// biome-ignore lint/suspicious/noExplicitAny:
export abstract class Entity<Props extends EntityTypes = any> {
  protected constructor(protected props: Props) {
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
    instance.validate(target);
    return instance;
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
}
