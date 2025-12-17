"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Car, CalendarCheck, TrendingUp, Package, CheckCircle, Clock, X, Users, BarChart, List, ArrowUpRight, ArrowDownRight, Check, CarFront, CalendarX, UserCheck, Ban } from 'lucide-react'
import { getDashboardStats } from '@/app/actions/admin'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface DashboardStatsProps {
  title?: string
  description?: string
  userRole?: 'admin' | 'superadmin'
}

export default function DashboardStats({ 
  title = "Dashboard Overview",
  description = "Key metrics and statistics for your dealership",
  userRole = 'admin'
}: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const swiperRef = useRef<any>(null)

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <ArrowDownRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load dashboard statistics</p>
        <button 
          onClick={fetchStats}
          className="mt-4 text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Calculate percentages
  const totalCars = stats.cars?.total || 1
  const availableCars = stats.cars?.available || 0
  const soldCars = stats.cars?.sold || 0
  const totalTestDrives = stats.testDrives?.total || 1
  
  const inventoryUtilization = Math.round((soldCars / totalCars) * 100)
  const availableInventory = Math.round((availableCars / totalCars) * 100)
  const testDriveCompletion = totalTestDrives > 0 
    ? Math.round((stats.testDrives?.completed || 0) / totalTestDrives * 100)
    : 0
  
  const conversionRate = stats.conversionRate || 0

  // Status percentages for test drives
  const statusPercentages = {
    pending: totalTestDrives > 0 ? Math.round((stats.testDrives?.pending || 0) / totalTestDrives * 100) : 0,
    confirmed: totalTestDrives > 0 ? Math.round((stats.testDrives?.confirmed || 0) / totalTestDrives * 100) : 0,
    completed: totalTestDrives > 0 ? Math.round((stats.testDrives?.completed || 0) / totalTestDrives * 100) : 0,
    cancelled: totalTestDrives > 0 ? Math.round((stats.testDrives?.cancelled || 0) / totalTestDrives * 100) : 0,
    noShow: totalTestDrives > 0 ? Math.round((stats.testDrives?.noShow || 0) / totalTestDrives * 100) : 0,
  }

  // Overview top cards data
  const overviewCards = [
    {
      id: 1,
      title: "Total Cars",
      value: stats.cars?.total || 0,
      icon: Car,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      details: `Available: ${stats.cars?.available || 0}, Sold: ${stats.cars?.sold || 0}`
    },
    {
      id: 2,
      title: "Test Drives",
      value: totalTestDrives,
      icon: CalendarCheck,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      details: `Pending: ${stats.testDrives?.pending || 0}, Confirmed: ${stats.testDrives?.confirmed || 0}`
    },
    {
      id: 3,
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      description: "From test drives to sales"
    },
    {
      id: 4,
      title: "Cars Sold",
      value: soldCars,
      icon: CheckCircle,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      description: `${inventoryUtilization}% of inventory`
    }
  ]

  // Test drives top cards data with updated icons
  const testDriveCards = [
    {
      id: 1,
      title: "Total Bookings",
      value: totalTestDrives,
      icon: List,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 2,
      title: "Pending",
      value: stats.testDrives?.pending || 0,
      icon: Clock,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      id: 3,
      title: "Confirmed",
      value: stats.testDrives?.confirmed || 0,
      icon: Check,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      id: 4,
      title: "Completed",
      value: stats.testDrives?.completed || 0,
      icon: CalendarCheck,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: 5,
      title: "Cancelled",
      value: stats.testDrives?.cancelled || 0,
      icon: X,
      bgColor: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400"
    }
  ]

  return (
    <div className="space-y-6 lg:mb-12 mb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2 ">
            <BarChart className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="test-drives" className="flex items-center gap-2 ">
            <CalendarCheck className="w-4 h-4" />
            Test Drives
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top 4 Cards - Desktop Grid / Mobile Swiper */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:mt-4 ">
            {overviewCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 hover:shadow-md transition-shadow h-full">
                  <CardContent className=" h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                          <p className="text-2xl font-bold mt-2">{card.value}</p>
                        </div>
                        <div className={`p-3 ${card.bgColor} rounded-full`}>
                          <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                        </div>
                      </div>
                      {card.details ? (
                        <div className="pt-3 border-t mt-auto">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {card.details}
                          </p>
                        </div>
                      ) : (
                        <div className="pt-3 border-t mt-auto">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {card.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile Swiper for Overview Cards */}
          <div className="md:hidden">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.2}
              navigation
              pagination={{ clickable: true }}
              className="pb-10"
            >
              {overviewCards.map((card) => (
                <SwiperSlide key={card.id}>
                  <Card className="bg-gray-50 dark:bg-gray-900 h-full">
                    <CardContent className=" h-full">
                      <div className="space-y-3 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                            <p className="text-2xl font-bold mt-2">{card.value}</p>
                          </div>
                          <div className={`p-3 ${card.bgColor} rounded-full`}>
                            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                          </div>
                        </div>
                        {card.details ? (
                          <div className="pt-3 border-t mt-auto">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {card.details}
                            </p>
                          </div>
                        ) : (
                          <div className="pt-3 border-t mt-auto">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {card.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Dealership Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dealership Summary</h3>
            
            {/* Two Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Car Inventory Card */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CarFront className="w-5 h-5" />
                    Car Inventory
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Available Inventory Capacity</span>
                        <span className="font-medium">{availableInventory}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${availableInventory}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {availableCars} out of {totalCars} cars available
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Drive Success Card */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Test Drive Success
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed Test Drives</span>
                        <span className="font-medium">{testDriveCompletion}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${testDriveCompletion}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.testDrives?.completed || 0} out of {totalTestDrives} test drives completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Row - Desktop Grid / Mobile Swiper */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {soldCars}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cars Sold</div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.testDrives?.confirmed || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upcoming Test Drives</div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {availableInventory}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inventory Utilization</div>
              </div>
            </div>

            {/* Mobile Swiper for Quick Stats */}
            <div className="md:hidden mt-6">
              <Swiper
                modules={[Pagination]}
                spaceBetween={16}
                slidesPerView={1.3}
                pagination={{ clickable: true }}
                className="pb-8"
              >
                <SwiperSlide>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {soldCars}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cars Sold</div>
                  </div>
                </SwiperSlide>
                
                <SwiperSlide>
                  <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.testDrives?.confirmed || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upcoming Test Drives</div>
                  </div>
                </SwiperSlide>
                
                <SwiperSlide>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {availableInventory}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Inventory Utilization</div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </TabsContent>

        {/* TEST DRIVES TAB */}
        <TabsContent value="test-drives" className="space-y-6">
          {/* Top 5 Cards - Desktop Grid / Mobile Swiper */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 lg:mt-4 gap-4">
            {testDriveCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="bg-gray-50 dark:bg-gray-900 hover:shadow-sm transition-shadow h-full">
                  <CardContent className=" h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                          <p className="text-2xl font-bold mt-2">{card.value}</p>
                        </div>
                        <div className={`p-3 ${card.bgColor} rounded-full`}>
                          <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile Swiper for Test Drive Cards */}
          <div className="md:hidden">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.3}
              navigation
              pagination={{ clickable: true }}
              className="pb-10"
            >
              {testDriveCards.map((card) => (
                <SwiperSlide key={card.id}>
                  <Card className="bg-gray-50 dark:bg-gray-900 h-full">
                    <CardContent className=" h-full">
                      <div className="space-y-3 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                            <p className="text-2xl font-bold mt-2">{card.value}</p>
                          </div>
                          <div className={`p-3 ${card.bgColor} rounded-full`}>
                            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Test Drive Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Drive Statistics</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Conversion Rate Card */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Conversion Rate
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="">
                      <div className="text-4xl font-bold mb-2">{conversionRate}%</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Test drives converted to sales
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {soldCars} sales from {stats.testDrives?.completed || 0} completed test drives
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rate Card */}
              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardContent className="">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Completion Rate
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="">
                      <div className="text-4xl font-bold mb-2">{testDriveCompletion}%</div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Test drives successfully completed
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.testDrives?.completed || 0} out of {totalTestDrives} test drives completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Status Breakdown */}
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Booking Status Breakdown</h4>
              
              <div className="space-y-3">
                {[
                  { 
                    status: 'Pending', 
                    count: stats.testDrives?.pending || 0, 
                    percentage: statusPercentages.pending, 
                    color: 'bg-yellow-500',
                    icon: Clock,
                    iconColor: 'text-yellow-500'
                  },
                  { 
                    status: 'Confirmed', 
                    count: stats.testDrives?.confirmed || 0, 
                    percentage: statusPercentages.confirmed, 
                    color: 'bg-green-500',
                    icon: Check,
                    iconColor: 'text-green-500'
                  },
                  { 
                    status: 'Completed', 
                    count: stats.testDrives?.completed || 0, 
                    percentage: statusPercentages.completed, 
                    color: 'bg-blue-500',
                    icon: CalendarCheck,
                    iconColor: 'text-blue-500'
                  },
                  { 
                    status: 'Cancelled', 
                    count: stats.testDrives?.cancelled || 0, 
                    percentage: statusPercentages.cancelled, 
                    color: 'bg-red-500',
                    icon: CalendarX,
                    iconColor: 'text-red-500'
                  },
                  { 
                    status: 'No Show', 
                    count: stats.testDrives?.noShow || 0, 
                    percentage: statusPercentages.noShow, 
                    color: 'bg-gray-500',
                    icon: Ban,
                    iconColor: 'text-gray-500'
                  }
                ].map((item, index) => (
                  <div key={item.status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                        <span>{item.status}</span>
                      </span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: 0.2 * (index + 1) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

