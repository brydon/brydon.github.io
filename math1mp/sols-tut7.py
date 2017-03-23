import numpy as np

def random_matrix_fun(n):
    B = 10 * np.random.random((n,n+1)) - 5

    A = B[:,:n]
    x = B[:,-1]

    b = np.matmul(A,x)

    print(b)

    w,X = np.linalg.eig(A)

    allRight = True
    for i in range(n):
        if not np.allclose(w[i]*X[:,i], np.matmul(A,X[:,i])):
            print("At least one eigenvalue is wrong!")
            allRight = False
            break

    if allRight:
        print("All the eigenvalues are correct!")

    return [A,b,w]


print(random_matrix_fun(3))
