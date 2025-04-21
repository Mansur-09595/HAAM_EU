import adsReducer from './slices/ads/adsSlice'
import favoritesReducer from './slices/favoritesSlice'
import authReducer from './slices/auth/authSlice'

export const rootReducer = {
  favorites: favoritesReducer,
  ads: adsReducer,
  auth: authReducer,
}
