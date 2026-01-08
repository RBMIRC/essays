// Hypothesis Integration for Quartz
// 
// To enable Hypothesis annotations on your Quartz site, you have two options:
//
// OPTION 1: Add to quartz/components/Head.tsx
// Find the Head component and add this script tag inside the <head>:
//
//   <script src="https://hypothes.is/embed.js" async></script>
//
// OPTION 2: Create a custom component
// Create a file at quartz/components/Hypothesis.tsx with:

/*
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Hypothesis: QuartzComponent = () => {
  return (
    <script src="https://hypothes.is/embed.js" async></script>
  )
}

export default (() => Hypothesis) satisfies QuartzComponentConstructor
*/

// Then add it to your quartz.layout.ts in the head array.
//
// PRIVATE GROUP SETUP:
// 1. Create account at https://hypothes.is/signup
// 2. Create private group at https://hypothes.is/groups/new
// 3. Share invite link with collaborators
// 4. Collaborators install browser extension and join group
// 5. When viewing your essays, select the group in Hypothesis sidebar
//
// GROUP CREATED: RetconBlackMountain
// Invite link: https://hypothes.is/groups/wwKpQDXD/retconblackmountain
