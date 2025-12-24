import type { Site, Page, Links, Socials } from "@types";

// Global
export const SITE: Site = {
  TITLE: "Jangdu's Blog",
  DESCRIPTION: "Welcome to Jangdu's Blog, a blog for developers.",
  AUTHOR: "Jangdu",
};

// // Work Page
// export const WORK: Page = {
//   TITLE: "Work",
//   DESCRIPTION: "Places I have worked.",
// }

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing about topics I am interested in.",
};

// Projects Page
// export const PROJECTS: Page = {
//   TITLE: "Projects",
//   DESCRIPTION: "Projects I have worked on.",
// };

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts by keyword.",
};

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  // {
  //   TEXT: "Work",
  //   HREF: "/work",
  // },
  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  // {
  //   TEXT: "Projects",
  //   HREF: "/projects",
  // },
];

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "jjd0324@gmail.com",
    HREF: "mailto:jjd0324@gmail.com",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "jangdu",
    HREF: "https://github.com/jangdu",
  },
  // {
  //   NAME: "LinkedIn",
  //   ICON: "linkedin",
  //   TEXT: "markhorn-dev",
  //   HREF: "https://www.linkedin.com/in/markhorn-dev/",
  // },
  // {
  //   NAME: "Twitter",
  //   ICON: "twitter-x",
  //   TEXT: "markhorn_dev",
  //   HREF: "https://twitter.com/markhorn_dev",
  // },
];
