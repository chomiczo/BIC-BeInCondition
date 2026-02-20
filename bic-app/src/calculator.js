// src/calculator.js

export const calculateBMR = (gender, weight, height, age) => {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  }
  return Math.round(bmr);
};

export const calculateTDEE = (bmr, pal) => {
  return Math.round(bmr * pal);
};

export const calculateFinalGoal = (tdee, goal) => {
  const deficitOrSurplus = 400; 
  switch (goal) {
    case 'lose': return tdee - deficitOrSurplus;
    case 'gain': return tdee + deficitOrSurplus;
    case 'maintain': default: return tdee;
  }
};