export const projectListQuery = /* groq */ `
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    listTitle,
    "slug": slug.current,
    "location": {
      "lat": location.lat,
      "lng": location.lng
    }
  }
`

export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    mapTitle,
    listTitle,
    "slug": slug.current,
    location,
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

export const locationsQuery = /* groq */ `
  *[_type == "project" && defined(location)]{
    "title": coalesce(mapTitle, title),
    "slug": slug.current,
    "lat": location.lat,
    "lng": location.lng
  }
`