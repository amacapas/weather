import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string,
  icon: string,
  main: string
}

type City = {
  'place name': string,
  longitude: string,
  state: string,
  'state abbreviation': string,
  latitude: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data[]>
) {
  try {
    const { places } = await getCoordinates(req.body)
  
    if(places) {
      const promises = places.map((city: City) => getWeather(city))
      const cities = await Promise.all(promises)

      res.status(200).json(cities)
    } else {
      res.status(200).json([])
    }

  } catch (error) {
    console.log((error as Error).message);
  }
}

const getWeather = async(city: City) => {
  const url = `${process.env.WEATHER}weather?lat=${city.latitude}&lon=${city.longitude}&appid=${process.env.API_KEY}&units=metric`
  const res = await fetch(url)
  const obj = await res.json()

  return {
    name: city['place name'],
    icon: process.env.IMG_URL + obj.weather[0].icon + '@2x.png',
    main: obj.weather[0].main
  }
}

const getCoordinates = async(zip: string) => {
  const url = process.env.ZIPPOTA + zip
  const res  = await fetch(url)
  return res.json()
}
