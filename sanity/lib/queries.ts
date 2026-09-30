export const aboutQuery = /* groq */ `
  *[_type == "about"][0]{
    _id,
    title,
    aboutText,
    "downloadCvUrl": downloadCV.asset->url,
    address,
    contactPhone,
    contactEmail
  }
`

export const aboutProjectsQuery = /* groq */ `
  *[_type == "aboutProject"] | order(_createdAt desc) {
    _id,
    title,
    description,
    image{
      alt,
      "url": asset->url
    }
  }
`

export const landingQuery = /* groq */ `
  *[_type == "landing"][0]{
    _id,
    title,
    enterText,
    heroImage{
      alt,
      "url": asset->url
    }
  }
`
