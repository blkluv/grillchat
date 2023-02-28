import { getSubsocialApi } from '@/subsocial-query'
import { Keyring } from '@polkadot/keyring'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

const schema = z.object({
  captchaToken: z.string(),
  address: z.string(),
})

type Data = {
  message: string
  hash?: string
}

const VERIFIER = 'https://hcaptcha.com/siteverify'
const TEST_SECRET = '0x0000000000000000000000000000000000000000'
async function verifyCaptcha(captchaToken: string) {
  const formData = new FormData()
  formData.append('secret', TEST_SECRET)
  formData.append('response', captchaToken)
  const res = await fetch(VERIFIER, {
    method: 'POST',
    body: formData,
  })
  const jsonRes = await res.json()
  if (!jsonRes.success) throw new Error('Invalid Token')
  return true
}

function getSenderAccount() {
  const mnemonic = process.env.SERVER_MNEMONIC
  if (!mnemonic) throw new Error('No mnemonic')
  const keyring = new Keyring()
  return keyring.addFromMnemonic(mnemonic)
}
async function sendToken(address: string) {
  const signer = getSenderAccount()
  if (!signer) throw new Error('Invalid Mnemonic')

  const subsocialApi = await getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi
  const amount = 0.1 * 10 ** 12
  const tx = await substrateApi.tx.balances
    .transfer(address, amount)
    .signAndSend(getSenderAccount())

  return tx.hash.toString()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') return res.status(404).end()

  const body = schema.safeParse(req.body)
  if (!body.success) {
    return res.status(400).send({
      message: `Invalid request body: ${body.error.message}`,
    })
  }

  try {
    await verifyCaptcha(body.data.captchaToken)
  } catch (e: any) {
    return res.status(400).send({
      message: `Captcha failed: ${e.message}`,
    })
  }

  let hash: string
  try {
    hash = await sendToken(body.data.address)
  } catch (e: any) {
    return res.status(500).send({
      message: `Failed to send token: ${e.message}`,
    })
  }

  return res.status(200).send({ message: 'OK', hash })
}