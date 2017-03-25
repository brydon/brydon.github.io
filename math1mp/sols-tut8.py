import numpy as np
import matplotlib.pyplot as plt

# Question 1

def partial_sum_sin(x,N):
    s = np.zeros(len(x))
    for i in range(N+1):
        s += (-1)**i/np.math.factorial(2*i+1)*x**(2*i+1)
    return s

x = np.arange(-30,30,0.1)

plt.plot(x,partial_sum_sin(x, 10),'r')
plt.plot(x,partial_sum_sin(x, 50),'g')
plt.plot(x,partial_sum_sin(x, 100),'b')
plt.plot(x,np.sin(x),'k')

plt.axis([-30,30,-2,2])

plt.show()

def partial_sum_sin_tol(x,tol=10**(-5)):
    s = np.zeros(len(x))
    i = 0
    while max(x)**(2*i+3)/np.math.factorial(2*i+3) > tol:
        s += (-1)**i/np.math.factorial(2*i+1)*x**(2*i+1)
        i += 1
    return s

plt.plot(x,partial_sum_sin_tol(x),'r')
plt.plot(x,np.sin(x),'k')

plt.axis([-30,30,-2,2])

plt.show()

# Question 2

def f(x,mu,sigma):
    return 1/np.sqrt(2*sigma**2*np.pi)*np.exp(-(x-mu)**2/(2*sigma**2))

mu = 50
sigma = 8
data = np.random.randn(1000) * sigma + mu

x = np.arange(0,100,0.1)

plt.hist(data,25,normed=1)

plt.plot(x,f(x,mu,sigma))
plt.axis((0,100,0,0.075))

plt.show()

