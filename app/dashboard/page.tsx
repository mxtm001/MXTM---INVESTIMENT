"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Wallet,
  BarChart3,
  Shield,
} from "lucide-react"
import Link from "next/link"

// Exchange rates (USD as base currency = 1)
const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 154.72,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.91,
  CNY: 7.23,
  INR: 83.47,
  BRL: 5.08,
  MXN: 16.73,
  SGD: 1.35,
  ZAR: 18.62,
  RUB: 92.5,
  TRY: 32.15,
  KRW: 1342.5,
  NGN: 1580.25,
  EGP: 48.75,
  AED: 3.67,
  SAR: 3.75,
}

// Currency mapping based on country
const currencyMap: { [key: string]: { symbol: string; code: string; name: string } } = {
  US: { symbol: "$", code: "USD", name: "US Dollar" },
  GB: { symbol: "£", code: "GBP", name: "British Pound" },
  DE: { symbol: "€", code: "EUR", name: "Euro" },
  FR: { symbol: "€", code: "EUR", name: "Euro" },
  IT: { symbol: "€", code: "EUR", name: "Euro" },
  ES: { symbol: "€", code: "EUR", name: "Euro" },
  NL: { symbol: "€", code: "EUR", name: "Euro" },
  BR: { symbol: "R$", code: "BRL", name: "Brazilian Real" },
  JP: { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  CA: { symbol: "C$", code: "CAD", name: "Canadian Dollar" },
  AU: { symbol: "A$", code: "AUD", name: "Australian Dollar" },
  IN: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  CN: { symbol: "¥", code: "CNY", name: "Chinese Yuan" },
  KR: { symbol: "₩", code: "KRW", name: "Korean Won" },
  MX: { symbol: "Mex$", code: "MXN", name: "Mexican Peso" },
  RU: { symbol: "₽", code: "RUB", name: "Russian Ruble" },
  ZA: { symbol: "R", code: "ZAR", name: "South African Rand" },
  NG: { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
  EG: { symbol: "£", code: "EGP", name: "Egyptian Pound" },
  AE: { symbol: "د.إ", code: "AED", name: "UAE Dirham" },
  SA: { symbol: "﷼", code: "SAR", name: "Saudi Riyal" },
  CH: { symbol: "CHF", code: "CHF", name: "Swiss Franc" },
  SG: { symbol: "S$", code: "SGD", name: "Singapore Dollar" },
  TR: { symbol: "₺", code: "TRY", name: "Turkish Lira" },
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState({ symbol: "$", code: "USD", name: "US Dollar" })
  const [country, setCountry] = useState("US")
  const [actualBalance, setActualBalance] = useState(145000) // User's actual withdrawable balance in USD
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)

      // Set user's balance to $145,000 if not already set
      initializeUserBalance(parsedUser.email)

      setUser(parsedUser)

      // Detect user's country and set currency
      detectCountryAndCurrency()
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const initializeUserBalance = (userEmail: string) => {
    try {
      // Get registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const userIndex = registeredUsers.findIndex((u: any) => u.email === userEmail)

      if (userIndex >= 0) {
        // Set balance to $145,000 if not already set or if less than $145,000
        if (!registeredUsers[userIndex].balance || registeredUsers[userIndex].balance < 145000) {
          registeredUsers[userIndex].balance = 145000
          localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))

          // Update current user session
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
          currentUser.balance = 145000
          localStorage.setItem("user", JSON.stringify(currentUser))

          console.log(`Set user ${userEmail} balance to $145,000`)
        }

        setActualBalance(registeredUsers[userIndex].balance)
      }
    } catch (error) {
      console.error("Error initializing user balance:", error)
    }
  }

  const detectCountryAndCurrency = async () => {
    try {
      // Try to get user's country from IP
      const response = await fetch("https://ipapi.co/json/")
      const data = await response.json()

      if (data.country_code) {
        const countryCode = data.country_code
        const currencyInfo = currencyMap[countryCode] || { symbol: "$", code: "USD", name: "US Dollar" }

        setCountry(countryCode)
        setCurrency(currencyInfo)

        console.log(`Detected country: ${countryCode}`)
        console.log(`Currency: ${currencyInfo.code}`)
      }
    } catch (error) {
      console.log("Could not detect location, using USD")
      // Fallback to USD if detection fails
      setCurrency({ symbol: "$", code: "USD", name: "US Dollar" })
      setCountry("US")
    }
  }

  const formatCurrency = (usdAmount: number) => {
    // Convert USD amount to local currency
    const exchangeRate = exchangeRates[currency.code] || 1
    const convertedAmount = usdAmount * exchangeRate

    // For currencies with no decimal places (like JPY, KRW)
    const noDecimalCurrencies = ["JPY", "KRW", "VND", "CLP", "PYG"]
    const decimals = noDecimalCurrencies.includes(currency.code) ? 0 : 2

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(convertedAmount)
  }

  const convertAmount = (usdAmount: number) => {
    const exchangeRate = exchangeRates[currency.code] || 1
    return usdAmount * exchangeRate
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050e24]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header with Country/Currency Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h1>
          <p className="text-gray-400">Here's your investment overview</p>
        </div>
        <div className="flex items-center gap-2 bg-[#0a1735] px-3 py-2 rounded-lg">
          <Globe className="h-4 w-4 text-[#f9a826]" />
          <span className="text-white text-sm">
            {country} • {currency.name}
          </span>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0a1735] border-[#253256]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-[#f9a826]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(actualBalance)}</div>
            <p className="text-xs text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Available for withdrawal
            </p>
            {currency.code !== "USD" && (
              <p className="text-xs text-gray-400 mt-1">≈ ${actualBalance.toLocaleString()} USD</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a1735] border-[#253256]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(98500)}</div>
            <p className="text-xs text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.2% this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1735] border-[#253256]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-[#f9a826]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(46500)}</div>
            <p className="text-xs text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +15.3% profit margin
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1735] border-[#253256]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Available</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(actualBalance)}</div>
            <p className="text-xs text-gray-400">Ready to withdraw</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/deposit">
          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500 hover:from-green-700 hover:to-green-800 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <ArrowDownRight className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">Deposit</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/withdraw">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <ArrowUpRight className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">Withdraw</p>
                <p className="text-xs text-white/80 mt-1">{formatCurrency(actualBalance)} available</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/investments">
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 hover:from-purple-700 hover:to-purple-800 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">Invest</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/verification">
          <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500 hover:from-orange-700 hover:to-orange-800 transition-all cursor-pointer">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <Shield className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">Verify</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Investment Plans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#0a1735] border-[#253256]">
          <CardHeader>
            <CardTitle className="text-white">Starter Plan</CardTitle>
            <CardDescription className="text-gray-400">Perfect for beginners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-[#f9a826]">5.2%</div>
            <p className="text-sm text-gray-400">Daily returns</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Minimum:</span>
                <span className="text-white">{formatCurrency(100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Maximum:</span>
                <span className="text-white">{formatCurrency(5000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">30 days</span>
              </div>
            </div>
            <Button className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black">Invest Now</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1735] border-[#253256] ring-2 ring-[#f9a826]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Professional Plan</CardTitle>
                <CardDescription className="text-gray-400">Most popular choice</CardDescription>
              </div>
              <Badge className="bg-[#f9a826] text-black">Popular</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-[#f9a826]">8.7%</div>
            <p className="text-sm text-gray-400">Daily returns</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Minimum:</span>
                <span className="text-white">{formatCurrency(5000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Maximum:</span>
                <span className="text-white">{formatCurrency(50000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">45 days</span>
              </div>
            </div>
            <Button className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black">Invest Now</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#0a1735] border-[#253256]">
          <CardHeader>
            <CardTitle className="text-white">VIP Plan</CardTitle>
            <CardDescription className="text-gray-400">Maximum returns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-[#f9a826]">12.5%</div>
            <p className="text-sm text-gray-400">Daily returns</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Minimum:</span>
                <span className="text-white">{formatCurrency(50000)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Maximum:</span>
                <span className="text-white">Unlimited</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">60 days</span>
              </div>
            </div>
            <Button className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black">Invest Now</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#0a1735] border-[#253256]">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-400">Your latest transactions and investments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#162040] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-white font-medium">Balance Updated</p>
                  <p className="text-sm text-gray-400">Account credited • Just now</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-medium">+{formatCurrency(145000)}</p>
                <p className="text-sm text-gray-400">Available</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#162040] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-white font-medium">Investment Profit</p>
                  <p className="text-sm text-gray-400">Professional Plan • 2 hours ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-medium">+{formatCurrency(1250)}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#162040] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-white font-medium">Deposit</p>
                  <p className="text-sm text-gray-400">Bitcoin • 1 day ago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-medium">+{formatCurrency(25000)}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
