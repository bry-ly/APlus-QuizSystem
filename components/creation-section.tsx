'use client'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, BookOpen, Users, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

const creationOptions = [
    {
        icon: FileText,
        title: 'Create Quiz',
        description: 'Build a new quiz with multiple question types for your students',
        href: '/quizzes/create',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
        icon: BookOpen,
        title: 'Add Course',
        description: 'Create a new course and manage student enrollment',
        href: '/courses/create',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
        icon: Users,
        title: 'Manage Students',
        description: 'View and manage student enrollments across your courses',
        href: '#',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
        icon: BarChart3,
        title: 'View Analytics',
        description: 'Analyze student performance and quiz statistics',
        href: '/analytics',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
]

export function CreationSection() {
    return (
        <section className="mb-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="size-5" />
                                Quick Creation
                            </CardTitle>
                            <CardDescription>
                                Create quizzes, courses, and manage your teaching resources
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {creationOptions.map((option, index) => {
                            const Icon = option.icon
                            return (
                                <Link key={index} href={option.href}>
                                    <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-primary/50 cursor-pointer group">
                                        <CardHeader className="pb-3">
                                            <div className={`${option.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                <Icon className={`size-6 ${option.color}`} />
                                            </div>
                                            <CardTitle className="text-base">{option.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm">
                                                {option.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}

