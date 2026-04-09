export const projectListQuery = /* groq */ `
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    listTitle,
    "slug": slug.current
  }
`

export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    listTitle,
    "slug": slug.current,
    description,
    image[]{
      _key,
      alt,
      "url": asset->url
    }
  }
`

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

