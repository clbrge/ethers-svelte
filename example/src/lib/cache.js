
import { ethers } from 'ethers'

import { defaultEvmStores, contracts } from 'svelte-ethers-store'


export const test = () => {

  console.log('inside module 1 => ', defaultEvmStores.$contracts )
  console.log('inside module 2 => ', defaultEvmStores.$contracts.link )

}
