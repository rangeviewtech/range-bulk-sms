# Architectural Patterns

## The "Container/Presenter" adaptation in Server Components
- **Server Components** act as the "Container". They fetch data directly from databases or services.
- **Client Components** act as the "Presenter". They receive data as props and handle interactivity.

## Service Layer
For complex business logic, abstract code out of the Next.js Route Handlers or Server Actions into dedicated services in `src/lib/services/`. This makes logic testable independently of the Next.js framework.

## Composition over Configuration
Prefer composing components with `children` over passing massive configuration objects as props.

**Bad:**
```tsx
<Header title="My App" showUserMenu={true} showThemeToggle={true} links={[{url: '/', label: 'Home'}]} />
```

**Good:**
```tsx
<Header>
  <HeaderLogo>My App</HeaderLogo>
  <HeaderNavigation links={links} />
  <HeaderActions>
    <ThemeToggle />
    <UserMenu />
  </HeaderActions>
</Header>
```
