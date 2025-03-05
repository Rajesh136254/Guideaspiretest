const classes = [
    {
      classId: 1,
      days: [
        {
          dayId: 1,
          video: "class1-day1.mp4",
          transcript: "Welcome to Kids Academy...",
          quiz: [
            {
              question: "What does the number zero represent?",
              type: "mcq",
              options: ["Many objects", "No objects", "One object", "Two objects"],
              answer: "No objects"
            },
            {
              question: "If there are no birds in the water, we use the number ______.",
              type: "fill-in-the-blank",
              answer: "zero"
            }
          ],
          project: {
            title: "Counting Adventure",
            instructions: "Help Chloe find her lost chickens and count them.",
            solution: "You need to count 5 chickens hidden in the scene."
          }
        },
        {
          dayId: 2,
          video: "class1-day2.mp4",
          transcript: "Today we will learn about shapes...",
          quiz: [
            {
              question: "How many sides does a triangle have?",
              type: "mcq",
              options: ["2", "3", "4", "5"],
              answer: "3"
            }
          ],
          project: {
            title: "Shape Hunt",
            instructions: "Find and count shapes in your house.",
            solution: "You should find at least 3 circles, 2 squares, and 1 triangle."
          }
        }
      ]
    }
  ];