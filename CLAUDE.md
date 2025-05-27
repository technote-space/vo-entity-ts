# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing & Quality
```bash
npm test                    # Run full test suite (format + typecheck + coverage)
npm run cover              # Run tests with coverage report only
npm run cover <file>       # Run specific test file with coverage
npm run typecheck          # TypeScript type checking
```

### Code Quality
```bash
npm run check              # Run linting and format checking
npm run check:fix          # Fix safe linting and formatting issues
npm run check:unsafe       # Fix all linting and formatting issues (including unsafe fixes)
npm run lint               # Linting only (using Biome)
npm run format             # Auto-format code (using Biome)
```

### Build
```bash
npm run build              # Generate TypeScript declarations + Rollup bundles
```

## Architecture Overview

This is a **Domain-Driven Design (DDD)** TypeScript library implementing immutable **Value Objects** and **Entities** with validation.

### Core Patterns

#### Value Object Pattern
- **Base class**: `ValueObject<Input, Output, Inner>`
- **Immutable outputs**: All values are frozen to prevent mutation
- **Validation**: Built-in validation with detailed error reporting
- **Nullable support**: Type-safe nullable values with `<Type, true>` generic

Key lifecycle:
```typescript
Input → fromInput() → Inner → toOutput() → Output (cached & frozen)
```

#### Entity Pattern
- **Base class**: `Entity<Props>`
- **Factory methods**: `_create()` (with validation), `_reconstruct()` (skip validation), `_update()` (partial update)
- **Property access**: `entity.get('prop')`
- **Identity-based equality**: Must implement `equals()` method

### Code Organization

#### Value Object Implementations
- Extend base `ValueObject` class with specific validation logic
- Override `fromInput()` and `toOutput()` for data transformation
- Implement `getErrors()` for validation rules
- Use existing patterns from `text.ts`, `email.ts`, `phone.ts`, etc.

#### Entity Implementations
- Protected constructors - force use of static factory methods
- Static methods must specify generic type: `Entity._create<ActualType>(...)`
- Properties should be Value Objects or other Entities
- Implement validation in factory methods, not constructors

### Key Conventions

1. **Protected constructors** for both Value Objects and Entities
2. **Abstract `symbol` property** required for each Value Object implementation
3. **Japanese error messages** for validation errors
4. **Test files** use `.spec.ts` or `.test.ts` suffixes
5. **Comprehensive test coverage** including validation scenarios and edge cases

### External Dependencies
- **validator**: Used for email, phone, URL validation
- **dayjs**: Date manipulation and formatting
- **ulid**: Unique identifier generation

### When Adding New Value Objects
1. Create implementation file in `src/valueObject/`
2. Create comprehensive test file
3. Add export to `src/index.ts`
4. Update README.md with usage examples
5. Follow existing patterns from similar Value Objects

### When Adding New Entities
1. Define props interface with Value Object properties
2. Implement static factory methods with proper generics
3. Implement `equals()` method based on business identity
4. Add comprehensive tests covering creation, updates, and validation
