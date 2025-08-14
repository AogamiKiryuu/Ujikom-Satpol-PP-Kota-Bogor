const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAnswerCorrectness() {
  try {
    console.log('Starting to fix answer correctness...');

    // Get all answers that don't have isCorrect set or are incorrect
    const answers = await prisma.answer.findMany({
      include: {
        question: {
          select: {
            correctAnswer: true,
          },
        },
        examResult: {
          select: {
            isCompleted: true,
          },
        },
      },
    });

    console.log(`Found ${answers.length} answers to check...`);

    let updatedCount = 0;

    for (const answer of answers) {
      if (answer.examResult.isCompleted && answer.selectedAnswer) {
        const isCorrect = answer.selectedAnswer === answer.question.correctAnswer;
        
        // Update the answer with correct isCorrect value
        await prisma.answer.update({
          where: { id: answer.id },
          data: { isCorrect },
        });

        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`Updated ${updatedCount} answers...`);
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} answers.`);
    console.log('Fix completed!');

  } catch (error) {
    console.error('Error fixing answer correctness:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAnswerCorrectness();
