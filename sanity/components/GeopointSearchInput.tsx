'use client'

import { type ChangeEvent, type KeyboardEvent, useMemo, useState } from 'react'
import { Button, Card, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { SearchIcon } from '@sanity/icons'
import { set, type ObjectInputProps } from 'sanity'

type GeopointValue = {
  _type?: 'geopoint'
  lat?: number
  lng?: number
  alt?: number
}

type MapboxFeature = {
  id: string
  place_name: string
  center: [number, number]
}

export default function GeopointSearchInput(props: ObjectInputProps<GeopointValue>) {
  const { value, onChange } = props
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<MapboxFeature[]>([])

  const mapboxToken = useMemo(
    () =>
      process.env.SANITY_STUDIO_MAPBOX_ACCESS_TOKEN ??
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
      '',
    [],
  )

  const runSearch = async () => {
    const term = query.trim()
    if (!term) return

    if (!mapboxToken) {
      setError(
        'Missing Mapbox token. Add SANITY_STUDIO_MAPBOX_ACCESS_TOKEN (or NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN).',
      )
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?limit=5&access_token=${encodeURIComponent(mapboxToken)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Search request failed')

      const data = await response.json()
      const features = Array.isArray(data?.features) ? data.features : []
      setResults(features)
      if (features.length === 0) setError('No locations found for this search.')
    } catch {
      setError('Could not search for locations right now.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const chooseLocation = (feature: MapboxFeature) => {
    onChange(
      set({
        _type: 'geopoint',
        lat: feature.center[1],
        lng: feature.center[0],
      }),
    )
    setQuery(feature.place_name)
    setResults([])
    setError(null)
  }

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} border tone="transparent">
        <Stack space={3}>
          <Text size={1}>Search place (city, address, landmark)</Text>
          <Flex gap={2}>
            <TextInput
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value)}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void runSearch()
                }
              }}
              placeholder="e.g. Madrid, Spain"
            />
            <Button
              text={loading ? 'Searching...' : 'Search'}
              icon={SearchIcon}
              mode="ghost"
              disabled={loading}
              onClick={() => void runSearch()}
            />
          </Flex>

          {error ? <Text size={1}>{error}</Text> : null}

          {results.length > 0 ? (
            <Stack space={2}>
              {results.map((feature) => (
                <Button
                  key={feature.id}
                  mode="bleed"
                  text={feature.place_name}
                  onClick={() => chooseLocation(feature)}
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Card>

      <Card padding={3} radius={2} border>
        <Text size={1}>
          Selected coordinates:{' '}
          {typeof value?.lat === 'number' && typeof value?.lng === 'number'
            ? `${value.lat}, ${value.lng}`
            : 'No location selected yet'}
        </Text>
      </Card>
    </Stack>
  )
}
