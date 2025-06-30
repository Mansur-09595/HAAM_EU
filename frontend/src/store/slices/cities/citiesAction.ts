import { createAsyncThunk } from '@reduxjs/toolkit'

type City = {
  name: string
  admin: string
}

type Geoname = {
  name: string
  adminName1?: string
}

export const fetchBelgianCities = createAsyncThunk<City[],void,{ rejectValue: string }
>('cities/fetchBelgian', async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/listings/belgian-cities/`
      )

      if (!res.ok) {
        return rejectWithValue('Ошибка при получении городов')
      }

      const data: { geonames?: Geoname[] } = await res.json()

      const cities: City[] = (data.geonames || []).map((g) => ({
        name: g.name,
        admin: g.adminName1 || '',
      }))

      return cities.sort((a, b) => a.name.localeCompare(b.name))
    } catch {
      return rejectWithValue('Ошибка сети')
    }
  }
)
