# Lab 2 Q8
for i in range(1,11):
   print(i)

output = 0
for i in range(1,101):
    output += i
print(output)

result = 1
for i in range(1,9):
    result *= i

print(result)

# Lab 2 Q 9
fib = [1, 1]

for i in range(20):
    fib.append(fib[-1]+fib[-2])

print(fib)

# Lab 3 Q1
for i in range(1,101):
    if i % 3 == 0 and i % 5 == 0:
        print("fizzbuzz")
    elif i % 3 == 0:
        print("fizz")
    elif i % 5 == 0:
        print("buzz")
    else:
        print(i)

# Lab 3 Q2 -- one option
for i in range(1,6):
    line = ""
    for j in range(i):
        line += str(i)
    print(line)

# Alternative

for i in range(1,6):
    for j in range(i):
        print(i,end="")
    print()

# Lab 3 Q3
lista = ["a","b","c","d","e","f","g","h","g","f"]

print(lista.index("b"))

letter = "f"

for index in range(len(lista)):
    if lista[index] == letter:
        print(index)
        break

for index in range(len(lista)):
    if lista[index] == letter:
        print(index)

# Lab 3 Q4

vector = [10,14,16,20]

vector.sort()

length = len(vector)

if length % 2 == 0:
    middle1 = int(length/2)
    middle2 = middle1 - 1
    middlenumber = (vector[middle1]+vector[middle2])/2
    print(middlenumber)
else:
    middle = int(length/2)
    print(vector[middle])

# Lab 3 Q5

population = 120
for i in range(100):
    population = 6*population/(2+population)

print(population)

# Part b

population = 120
years = 0
while population-4>=0.01:
    years += 1
    population = 6*population/(2+population)
print(years)