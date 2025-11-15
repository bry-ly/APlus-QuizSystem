import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to generate unique access codes
function generateAccessCode(): string {
  // Generate exactly 6 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const timePart = (Date.now() % 1000000).toString().padStart(6, '0');
  const extraRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const combinedTime = (timePart.slice(0, 3) + extraRandom).slice(0, 6);
  return `${randomPart}-${combinedTime}`;
}

// Courses data based on the system requirements
const COURSES_DATA = [
  { name: "B.S. in Criminology", code: "BSCRIM-CJE" },
  { name: "B.S. in Information Technology", code: "BSIT-ECT" },
  { name: "B.S. in Computer Science", code: "BSCS-ECT" },
  { name: "B.S. in Electronics Engineering", code: "BSEE-ECT" },
  { name: "B.S. in Computer Engineering", code: "BSCPE-ECT" },
  { name: "B.S. in Tourism Management", code: "BSTM-BHT" },
  { name: "B.S. in Hospitality Management", code: "BSHM-BHT" },
  {
    name: "B.S. in Bus. Ad. Major in Financial Management",
    code: "BSBA-FM-BHT",
  },
  {
    name: "B.S. in Bus. Ad. Major in Marketing Management",
    code: "BSBA-MM-BHT",
  },
  { name: "Bachelor of Elem. Ed.", code: "BEED-EDUC" },
  { name: "Bachelor of Sec. Ed. Major in English", code: "BSED-ENG-EDUC" },
  {
    name: "Bachelor of Sec. Ed. Major in Mathematics",
    code: "BSED-MATH-EDUC",
  },
  {
    name: "Bachelor of Sec. Ed. Major in Social Studies",
    code: "BSED-SS-EDUC",
  },
  { name: "Grade 11", code: "G11-SHS" },
  { name: "Grade 12", code: "G12-SHS" },
];

// Departments data
const DEPARTMENTS_DATA = [
  { name: "Electronics and Computer Technology", code: "ECT" },
  { name: "Business, Hospitality & Tourism", code: "BHT" },
  { name: "Criminal Justice Education", code: "CJE" },
  { name: "Education", code: "EDUC" },
  { name: "Senior High School", code: "SHS" },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Seed Departments
  console.log("\n📚 Seeding Departments...");
  let departmentsCreated = 0;
  let departmentsSkipped = 0;

  for (const dept of DEPARTMENTS_DATA) {
    try {
      const existing = await prisma.department.findUnique({
        where: { code: dept.code },
      });

      if (existing) {
        console.log(`   ⏭️  Skipped: ${dept.name} (${dept.code}) - already exists`);
        departmentsSkipped++;
      } else {
        await prisma.department.create({
          data: {
            id: crypto.randomUUID(),
            name: dept.name,
            code: dept.code,
          },
        });
        console.log(`   ✅ Created: ${dept.name} (${dept.code})`);
        departmentsCreated++;
      }
    } catch (error) {
      console.error(`   ❌ Error creating ${dept.name}:`, error);
    }
  }

  console.log(
    `\n   Summary: ${departmentsCreated} created, ${departmentsSkipped} skipped`
  );

  // Seed Courses
  console.log("\n📖 Seeding Courses...");
  let coursesCreated = 0;
  let coursesSkipped = 0;

  for (const course of COURSES_DATA) {
    try {
      const existing = await prisma.course.findUnique({
        where: { code: course.code },
      });

      if (existing) {
        console.log(
          `   ⏭️  Skipped: ${course.name} (${course.code}) - already exists`
        );
        coursesSkipped++;
      } else {
        await prisma.course.create({
          data: {
            id: crypto.randomUUID(),
            name: course.name,
            code: course.code,
          },
        });
        console.log(`   ✅ Created: ${course.name} (${course.code})`);
        coursesCreated++;
      }
    } catch (error) {
      console.error(`   ❌ Error creating ${course.name}:`, error);
    }
  }

  console.log(
    `\n   Summary: ${coursesCreated} created, ${coursesSkipped} skipped`
  );

  // Seed Sample Teacher and Quizzes
  console.log("\n👨‍🏫 Seeding Sample Teacher and Quizzes...");
  
  // Check if sample teacher exists
  let sampleTeacher = await prisma.user.findFirst({
    where: { email: "teacher@example.com" },
  });

  if (!sampleTeacher) {
    const ectDept = await prisma.department.findUnique({
      where: { code: "ECT" },
    });

    if (ectDept) {
      // Create sample teacher account
      sampleTeacher = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          firstName: "Sample",
          lastName: "Teacher",
          email: "teacher@example.com",
          role: "teacher",
          emailVerified: true,
          departmentId: ectDept.id,
        },
      });
      
      // Create account with password
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: crypto.randomUUID(),
          providerId: "credential",
          userId: sampleTeacher.id,
          password: "$2a$10$YourHashedPasswordHere", // You should hash this properly
        },
      });
      
      console.log(`   ✅ Created sample teacher: ${sampleTeacher.email}`);
    }
  } else {
    console.log(`   ⏭️  Sample teacher already exists`);
  }

  // Create sample quizzes if teacher exists
  if (sampleTeacher) {
    const mathCourse = await prisma.course.findFirst({
      where: { code: "BSED-MATH-EDUC" },
    });
    
    const itCourse = await prisma.course.findFirst({
      where: { code: "BSIT-ECT" },
    });

    const csCourse = await prisma.course.findFirst({
      where: { code: "BSCS-ECT" },
    });

    let quizzesCreated = 0;

    // Sample Quiz 1: Mathematics Basic Algebra
    if (mathCourse) {
      const existingQuiz1 = await prisma.quiz.findFirst({
        where: { title: "Basic Algebra Quiz" },
      });

      if (!existingQuiz1) {
        await prisma.quiz.create({
          data: {
            id: crypto.randomUUID(),
            title: "Basic Algebra Quiz",
            description: "Test your understanding of basic algebraic concepts",
            courseId: mathCourse.id,
            createdById: sampleTeacher.id,
            accessCode: generateAccessCode(),
            timeLimit: 30,
            passingScore: 70,
            isActive: true,
            showResults: true,
            questions: {
              create: [
                {
                  id: crypto.randomUUID(),
                  text: "What is 2x + 5 = 15, solve for x?",
                  type: "multiple-choice",
                  options: ["5", "10", "7", "3"],
                  correctAnswer: "0",
                  points: 1,
                  order: 0,
                },
                {
                  id: crypto.randomUUID(),
                  text: "Simplify: 3(x + 4) - 2x",
                  type: "multiple-choice",
                  options: ["x + 12", "5x + 12", "x + 4", "5x + 4"],
                  correctAnswer: "0",
                  points: 1,
                  order: 1,
                },
                {
                  id: crypto.randomUUID(),
                  text: "If y = 2x + 3 and x = 4, what is y?",
                  type: "multiple-choice",
                  options: ["11", "9", "7", "13"],
                  correctAnswer: "0",
                  points: 1,
                  order: 2,
                },
              ],
            },
          },
        });
        quizzesCreated++;
        console.log(`   ✅ Created: Basic Algebra Quiz`);
      }
    }

    // Sample Quiz 2: Programming Fundamentals
    if (itCourse) {
      const existingQuiz2 = await prisma.quiz.findFirst({
        where: { title: "Programming Fundamentals" },
      });

      if (!existingQuiz2) {
        await prisma.quiz.create({
          data: {
            id: crypto.randomUUID(),
            title: "Programming Fundamentals",
            description: "Basic programming concepts and logic",
            courseId: itCourse.id,
            createdById: sampleTeacher.id,
            accessCode: generateAccessCode(),
            timeLimit: 45,
            passingScore: 75,
            isActive: true,
            showResults: true,
            questions: {
              create: [
                {
                  id: crypto.randomUUID(),
                  text: "What does HTML stand for?",
                  type: "multiple-choice",
                  options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Home Tool Markup Language",
                    "Hyperlinks and Text Markup Language",
                  ],
                  correctAnswer: "0",
                  points: 1,
                  order: 0,
                },
                {
                  id: crypto.randomUUID(),
                  text: "Which of these is a programming language?",
                  type: "multiple-choice",
                  options: ["HTML", "CSS", "Python", "XML"],
                  correctAnswer: "2",
                  points: 1,
                  order: 1,
                },
                {
                  id: crypto.randomUUID(),
                  text: "What is a variable in programming?",
                  type: "multiple-choice",
                  options: [
                    "A storage location with a name",
                    "A type of loop",
                    "A function",
                    "A class",
                  ],
                  correctAnswer: "0",
                  points: 1,
                  order: 2,
                },
                {
                  id: crypto.randomUUID(),
                  text: "What does API stand for?",
                  type: "multiple-choice",
                  options: [
                    "Application Programming Interface",
                    "Advanced Programming Integration",
                    "Automated Program Interaction",
                    "Application Process Integration",
                  ],
                  correctAnswer: "0",
                  points: 1,
                  order: 3,
                },
              ],
            },
          },
        });
        quizzesCreated++;
        console.log(`   ✅ Created: Programming Fundamentals`);
      }
    }

    // Sample Quiz 3: Data Structures
    if (csCourse) {
      const existingQuiz3 = await prisma.quiz.findFirst({
        where: { title: "Introduction to Data Structures" },
      });

      if (!existingQuiz3) {
        await prisma.quiz.create({
          data: {
            id: crypto.randomUUID(),
            title: "Introduction to Data Structures",
            description: "Learn about arrays, stacks, queues, and linked lists",
            courseId: csCourse.id,
            createdById: sampleTeacher.id,
            accessCode: generateAccessCode(),
            timeLimit: 60,
            passingScore: 80,
            isActive: true,
            showResults: true,
            questions: {
              create: [
                {
                  id: crypto.randomUUID(),
                  text: "What is the time complexity of accessing an element in an array by index?",
                  type: "multiple-choice",
                  options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
                  correctAnswer: "0",
                  points: 2,
                  order: 0,
                },
                {
                  id: crypto.randomUUID(),
                  text: "Which data structure uses LIFO (Last In First Out)?",
                  type: "multiple-choice",
                  options: ["Queue", "Stack", "Array", "Tree"],
                  correctAnswer: "1",
                  points: 2,
                  order: 1,
                },
                {
                  id: crypto.randomUUID(),
                  text: "In a linked list, each node contains:",
                  type: "multiple-choice",
                  options: [
                    "Data and pointer to next node",
                    "Only data",
                    "Only pointer",
                    "Index and data",
                  ],
                  correctAnswer: "0",
                  points: 2,
                  order: 2,
                },
              ],
            },
          },
        });
        quizzesCreated++;
        console.log(`   ✅ Created: Introduction to Data Structures`);
      }
    }

    console.log(`\n   Summary: ${quizzesCreated} quizzes created`);
  }

  console.log("\n✨ Seed completed successfully!");
  console.log(`\n📊 Final Summary:`);
  console.log(`   Departments: ${departmentsCreated} created, ${departmentsSkipped} skipped`);
  console.log(`   Courses: ${coursesCreated} created, ${coursesSkipped} skipped`);
  console.log(`   Sample data: Teacher and quizzes seeded`);
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
