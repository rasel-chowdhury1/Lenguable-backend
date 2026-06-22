import { IHero } from "./hero.interface";
import { Hero } from "./hero.model";

const createHero = async (payload: IHero) => {
  const result = await Hero.create(payload);
  return result;
};

const getHero = async () => {
  const result = await Hero.findOne();
  return result;
};

const updateHero = async (id: string, payload: Partial<IHero>) => {
  const result = await Hero.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteHero = async (id: string) => {
  const result = await Hero.findByIdAndDelete(id);
  return result;
};

export const HeroServices = {
  createHero,
  getHero,
  updateHero,
  deleteHero,
};
