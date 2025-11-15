'use client'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, BookOpen, BarChart3, Clock, CheckCircle2, FileText, Users, Award } from 'lucide-react'

const studentFeatures = [
    {
        icon: BookOpen,
        title: 'Take Quizzes',
        description: 'Access and complete quizzes assigned by your teachers with ease.',
    },
    {
        icon: Clock,
        title: 'Timed Assessments',
        description: 'Complete quizzes within the allocated time to test your knowledge.',
    },
    {
        icon: BarChart3,
        title: 'Track Progress',
        description: 'View your quiz results and track your academic progress over time.',
    },
    {
        icon: Award,
        title: 'View Scores',
        description: 'See your scores immediately after completing quizzes.',
    },
]

const teacherFeatures = [
    {
        icon: FileText,
        title: 'Create Quizzes',
        description: 'Build comprehensive quizzes with multiple question types for your students.',
    },
    {
        icon: Users,
        title: 'Manage Classes',
        description: 'Organize quizzes by courses and manage student access efficiently.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description: 'Get detailed insights into student performance and quiz statistics.',
    },
    {
        icon: CheckCircle2,
        title: 'Auto Grading',
        description: 'Automatically grade multiple-choice and true/false questions instantly.',
    },
]

export function FeaturesSection() {
    return (
        <section id="features" className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Designed for Your School
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        A comprehensive quiz platform built specifically for educational institutions
                    </p>
                </div>

                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Students Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary/10 p-3 rounded-lg">
                                <GraduationCap className="size-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold">For Students</h3>
                                <p className="text-sm text-muted-foreground">Everything you need to succeed</p>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {studentFeatures.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <Card key={index} className="border-border/50">
                                        <CardHeader className="pb-3">
                                            <div className="mb-2">
                                                <Icon className="size-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-base">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm">
                                                {feature.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                    {/* Teachers Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary/10 p-3 rounded-lg">
                                <Users className="size-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold">For Teachers</h3>
                                <p className="text-sm text-muted-foreground">Powerful tools for educators</p>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {teacherFeatures.map((feature, index) => {
                                const Icon = feature.icon
                                return (
                                    <Card key={index} className="border-border/50">
                                        <CardHeader className="pb-3">
                                            <div className="mb-2">
                                                <Icon className="size-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-base">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-sm">
                                                {feature.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

