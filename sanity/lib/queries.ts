export const aboutProjectsQuery = /* groq */ `
  *[_type == "aboutProject"] | order(_createdAt desc) {
    _id,
    title,
    description,
    image{
      alt,
      hotspot,
      crop,
      asset,
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
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
      hotspot,
      crop,
      asset,
      "url": asset->url
    }
  }
`

export const homeQuery = /* groq */ `
  *[_type == "home"][0]{
    _id,
    title,
    "slides": images[]{
      _key,
      title,
      mediaType,
      image{
        alt,
        hotspot,
        crop,
        asset,
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      "videoUrl": video.asset->url,
      poster{
        alt,
        hotspot,
        asset,
        "url": asset->url
      },
      "project": project->{
        _id,
        title,
        "slug": slug.current
      }
    }
  }
`

export const projectBySlugQuery = /* groq */ `
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    blocks[]{
      _key,
      _type,
      mediaType,
      displayMode,
      caption,
      text,
      textMobile,
      image{
        alt,
        hotspot,
        crop,
        asset,
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      "videoUrl": video.asset->url,
      "videoWidth": video.asset->metadata.dimensions.width,
      "videoHeight": video.asset->metadata.dimensions.height,
      poster{
        alt,
        asset,
        "url": asset->url
      }
    }
  }
`
