import adsReducer from './slices/ads/adsSlice'
import favoritesReducer from './slices/favoritesSlice'
import authReducer from './slices/auth/authSlice'
import categoriesReducer from './slices/categories/categoriesSlice'
import adsByCategoryReducer from './slices/categories/extracted/adsByCategorySlice'
import usersReducer from './slices/auth/users/usersSlice'
import citiesReducer from './slices/cities/citiesSlice'

export const rootReducer = {
  favorites: favoritesReducer,
  ads: adsReducer,
  auth: authReducer,
  categories: categoriesReducer,
  adsByCategory: adsByCategoryReducer,
  users: usersReducer,
  cities: citiesReducer,
}
