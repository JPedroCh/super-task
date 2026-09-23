### **What was wrong?**

The button was redirecting users to the previous page in their browsing history rather than specifically to the job board page. This could take users outside the Athyna website, particularly when they arrived at the job details page through an external source such as Google.

### Why it's a product-level miss and not just a code bug?

This is a case that directly affects the user experience by taking users away from the Athyna website without ensuring their return. As a result, it represents a missed opportunity to expose users to pages they have not yet visited.

Considering that a portion of the traffic to the job details page comes from Google, for example, these users could be redirected back to Google rather than to Athyna's job board. This creates unnecessary friction in the user journey and potentially limits further engagement with the platform.

### How you'd fix it?

I would add an optional parameter specifying the route to which the button should redirect. If the parameter is not provided, the default behavior would remain unchanged, redirecting the user to the previous route as it does currently.

First on the button component file `(src/app/role/[slug]/_components/back-button.tsx)`, update the button props to optionally accept a target route:

```tsx
type BackButtonProps = {
  redirectTo?: string;
};
```

Then, update `handleBackClick` so that it navigates to the specified route when `redirectTo` is provided. Otherwise, it preserves the existing behavior and navigates to the previous route:

```tsx
const handleBackClick = () => {
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }
    router.back();
  };
```

Finally, on the job details page`(src/app/role/[slug]/page.tsx)`, pass `/` as the `redirectTo` value, since the job board is served from the application's root route:

```tsx
<BackButton redirectTo="/"/>
```