"use client"

import { useState, useEffect } from "react"
import { currencies } from "./currency-selector"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

// Extended exchange rates for all currencies (in a real app, these would come from an API)
const exchangeRates = {
  // North America
  USD: 1,
  CAD: 1.36,
  MXN: 16.73,

  // South America
  BRL: 5.08,
  ARS: 880.5,
  CLP: 932.45,
  COP: 3950.25,
  PEN: 3.7,
  UYU: 39.15,
  VES: 36.55,

  // Europe
  EUR: 0.93,
  GBP: 0.79,
  CHF: 0.91,
  NOK: 10.75,
  SEK: 10.55,
  DKK: 6.92,
  PLN: 3.95,
  CZK: 23.15,
  HUF: 356.8,
  RON: 4.62,
  BGN: 1.82,
  HRK: 7.02,
  RSD: 109.25,
  ISK: 138.5,
  UAH: 39.85,
  RUB: 92.5,
  TRY: 32.15,

  // Asia
  JPY: 154.72,
  CNY: 7.23,
  HKD: 7.82,
  KRW: 1350.45,
  INR: 83.47,
  IDR: 15750.25,
  MYR: 4.65,
  PHP: 56.85,
  SGD: 1.35,
  THB: 35.75,
  VND: 25150.5,
  PKR: 278.35,
  BDT: 110.25,
  NPR: 133.5,
  LKR: 315.75,
  ILS: 3.68,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,

  // Oceania
  AUD: 1.52,
  NZD: 1.65,
  FJD: 2.25,
  PGK: 3.75,
  SBD: 8.45,
  TOP: 2.35,
  VUV: 119.5,
  WST: 2.75,

  // Africa
  ZAR: 18.62,
  EGP: 47.85,
  NGN: 1450.25,
  GHS: 14.75,
  KES: 129.5,
  MAD: 9.95,
  TND: 3.12,
  DZD: 134.75,
  UGX: 3750.25,
  TZS: 2650.5,
  ETB: 56.75,
  ZMW: 25.85,
  XOF: 610.25,
  XAF: 610.25,
}

interface CurrencyConverterProps {
  fromCurrency: string
  toCurrency: string
  amount: string
  readOnly?: boolean
}

export function CurrencyConverter({ fromCurrency, toCurrency, amount, readOnly = false }: CurrencyConverterProps) {
  const [convertedAmount, setConvertedAmount] = useState("0.00")

  useEffect(() => {
    if (!amount || isNaN(Number(amount))) {
      setConvertedAmount("0.00")
      return
    }

    // Get the exchange rates
    const fromRate = exchangeRates[fromCurrency as keyof typeof exchangeRates] || 1
    const toRate = exchangeRates[toCurrency as keyof typeof exchangeRates] || 1

    // Calculate the converted amount
    const amountInUSD = Number(amount) / fromRate
    const convertedValue = amountInUSD * toRate

    // Format the result
    setConvertedAmount(convertedValue.toFixed(2))
  }, [amount, fromCurrency, toCurrency])

  // Find currency symbols
  const fromSymbol = currencies.find((c) => c.code === fromCurrency)?.symbol || "$"
  const toSymbol = currencies.find((c) => c.code === toCurrency)?.symbol || "$"

  return (
    <div className="bg-[#162040] p-4 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <Label htmlFor="fromAmount" className="text-sm text-gray-400">
            {fromCurrency}
          </Label>
          <div className="text-lg font-medium">
            {fromSymbol} {amount || "0.00"}
          </div>
        </div>
        <ArrowRight className="mx-4 text-gray-400" />
        <div className="flex-1">
          <Label htmlFor="toAmount" className="text-sm text-gray-400">
            {toCurrency}
          </Label>
          <div className="text-lg font-medium">
            {toSymbol} {convertedAmount}
          </div>
        </div>
      </div>
      {!readOnly && (
        <p className="text-xs text-gray-400">
          Exchange rate: 1 {fromCurrency} ={" "}
          {(
            exchangeRates[toCurrency as keyof typeof exchangeRates] /
            exchangeRates[fromCurrency as keyof typeof exchangeRates]
          ).toFixed(4)}{" "}
          {toCurrency}
        </p>
      )}
    </div>
  )
}
