import { client } from '$services/redis';
import { userLikesKey, itemsKey } from '$services/keys';
import { getItems } from './items';
import { get } from 'svelte/store';

export const userLikesItem = async (itemId: string, userId: string) => {
  return client.sIsMember(userLikesKey(userId), itemId);
};

export const likedItems = async (userId: string) => {
  // user가 좋아요한 itemId 목록을 반환
  const ids = await client.sMembers(userLikesKey(userId));

  // user가 가진 item Hash를 배열로 반황
  return getItems(ids);

};

export const likeItem = async (itemId: string, userId: string) => {
  const inserted = await client.sAdd(userLikesKey(userId), itemId);

  if (inserted) {
    return client.hIncrBy(itemsKey(itemId), 'likes', 1);
  }
};

export const unlikeItem = async (itemId: string, userId: string) => {
  const removed = await client.sRem(userLikesKey(userId), itemId);

  if(removed){
    return client.hIncrBy(itemsKey(itemId), 'likes', -1);
  }
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
  const ids = await client.sInter([userLikesKey(userOneId), userLikesKey(userTwoId)]);

  return getItems(ids);

};
