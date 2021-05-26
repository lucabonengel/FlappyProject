import numpy as np


########## DATA ANALYSIS ##########


###################################
#### TESTS MUATION RATE/RANGE #####
###################################


# TEST 1
results1 = np.array([15, 61, 37, 39, 40, 101, 20, 29, 83, 14, 47, 60, 11, 91, 84, 14, 35, 76, 22, 66, 116, 52, 48, 13, 45,
                     25, 12, 68, 47, 63, 20, 8, 58, 23, 13, 23, 63, 43, 16, 86, 27, 14, 19, 25, 36, 37, 44, 11, 57, 51])
print(np.mean(results1))  # 42.16
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights of synapses
#mutationRange: 0.5,     // Interval of the mutation changes on the synapse weight


# TEST 2
results2 = np.array([23, 26, 71, 40, 23, 36, 28, 42, 41, 63, 72, 70, 50, 69, 41, 25, 32, 42, 53, 17, 60, 17, 39,
                     46, 56, 68, 30, 26, 34, 25, 96, 86, 62, 29, 29, 51, 60, 68, 33, 51, 34, 65, 36, 44, 46, 45, 11, 35, 50, 2])
print(np.mean(results2))  # 43.96
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.3,      // Mutation rate on the weights of synapses
#mutationRange: 0.5,     // Interval of the mutation changes on the synapse weight


# TEST 3
results3 = np.array([19, 53, 100, 67, 93, 73, 71, 30, 57, 88, 15, 58, 38, 43, 68, 37, 71, 64, 50, 30, 19, 39,
                     52, 14, 33, 26, 65, 19, 25, 72, 52, 19, 31, 44, 6, 55, 67, 57, 67, 6, 75, 42, 29, 65, 23, 76, 59, 73, 13, 97])
print(np.mean(results3))  # 48.9
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.5,      // Mutation rate on the weights of synapses
#mutationRange: 0.5,     // Interval of the mutation changes on the synapse weight


# TEST 4
results4 = np.array([89, 73, 30, 58, 46, 52, 24, 36, 57, 80, 63, 72, 31, 102, 18, 47, 75, 48, 77, 7, 81, 66, 37,
                       60, 57, 96, 68, 127, 82, 35, 36, 45, 15, 73, 24, 52, 106, 25, 51, 42, 38, 79, 25, 35, 12, 40, 84, 58, 44, 35])
print(np.mean(results4))  # 54.26
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.7,      // Mutation rate on the weights of synapses
#mutationRange: 0.5,     // Interval of the mutation changes on the synapse weight


# TEST 5
results5 = np.array([54, 82, 37, 53, 21, 74, 22, 83, 67, 15, 33, 58, 68, 77, 26, 97, 62, 65, 203, 44, 42, 87, 63,
                       87, 38, 102, 33, 48, 65, 82, 27, 32, 49, 51, 87, 71, 71, 197, 28, 54, 54, 39, 40, 106, 107, 48, 59, 124, 69, 38])
print(np.mean(results5))  # 64.78
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.9,      // Mutation rate on the weights of synapses
#mutationRange: 0.5,     // Interval of the mutation changes on the synapse weight


# TEST 6
results6 = np.array([116, 64, 22, 62, 20, 45, 5, 68, 5, 52, 14, 24, 14, 337, 32, 77, 140, 37, 18, 15, 73, 8, 9,
                       37, 13, 33, 47, 263, 12, 12, 16, 8, 84, 41, 12, 6, 51, 115, 56, 10, 19, 31, 12, 92, 188, 28, 19, 266, 97, 25])
print(np.mean(results6))  # 57.0
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights of synapses
#mutationRange: 0.1,     // Interval of the mutation changes on the synapse weight


# TEST 7
results7 = np.array([21, 25, 24, 23, 8, 17, 14, 89, 82, 13, 48, 29, 22, 14, 165, 8, 68, 37, 4, 129, 11, 28, 22,
                     39, 20, 27, 19, 51, 20, 97, 12, 151, 21, 77, 20, 112, 26, 12, 36, 121, 16, 33, 62, 33, 167, 16, 31, 32, 55, 160])
print(np.mean(results7))  # 47.34
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights of synapses
#mutationRange: 0.3,     // Interval of the mutation changes on the synapse weight


# TEST 8
results8 = np.array([19, 77, 87, 13, 60, 22, 42, 49, 109, 14, 123, 29, 23, 14, 35, 27, 52, 58, 52, 36, 99, 25, 31, 60, 86,
                     57, 35, 63, 30, 22, 66, 30, 106, 23, 8, 99, 44, 32, 35, 62, 19, 45, 21, 9, 35, 61, 6, 70, 28, 27])
print(np.mean(results8))  # 45.5
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights of synapses
#mutationRange: 0.7,     // Interval of the mutation changes on the synapse weight


# TEST 9
results9 = np.array([77, 100, 42, 89, 16, 118, 53, 23, 38, 47, 49, 49, 39, 58, 37, 90, 22, 31, 18, 69, 26, 49,
                     50, 95, 54, 43, 39, 46, 52, 49, 33, 22, 63, 45, 12, 8, 32, 112, 59, 77, 103, 10, 38, 84, 22, 32, 6, 49, 28, 68])
print(np.mean(results9))  # 49.42
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kepts unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights of synapses
#mutationRange: 0.9,     // Interval of the mutation changes on the synapse weight








print('\n')
###################################
####### TESTS NETWORK SIZE ########
###################################


network1 = np.array([75, 45, 32, 31, 80, 10, 8, 11, 50, 31, 45, 41, 38, 66, 23, 45, 23, 34, 66, 76, 47, 4, 59,
                     78, 30, 9, 27, 17, 18, 55, 30, 33, 137, 38, 97, 98, 50, 24, 31, 25, 12, 33, 38, 26, 51, 116, 37, 19, 9, 52])
print(np.mean(network1))  # 42.6
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


network2 = np.array([47, 119, 53, 130, 64, 37, 300, 48, 156, 37, 73, 81, 152, 57, 51, 34, 30, 63, 19, 118, 47, 53, 142,
                     89, 109, 46, 124, 88, 129, 32, 48, 107, 66, 62, 287, 132, 69, 109, 282, 55, 72, 98, 26, 86, 107, 85, 55, 61, 86, 191])
print(np.mean(network2))  # 92.24
#network: [2, [3, 3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


network3 = np.array([176, 22, 16, 139, 177, 2, 71, 82, 39, 49, 92, 31, 5, 18, 34, 137, 27, 1, 3, 169, 23, 40, 203, 115,
                     15, 34, 36, 160, 163, 22, 88, 208, 6, 8, 40, 160, 170, 77, 71, 248, 15, 57, 242, 165, 85, 12, 104, 43, 155, 60])
print(np.mean(network3))  # 82.3
#network: [2, [], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


network4 = np.array([19, 23, 48, 35, 37, 8, 47, 13, 32, 11, 60, 54, 11, 65, 21, 19, 104, 96, 107, 51, 121, 41, 50,
                     25, 38, 28, 46, 48, 10, 12, 21, 61, 28, 41, 129, 17, 21, 10, 55, 59, 79, 114, 12, 11, 20, 28, 15, 18, 27, 38])
print(np.mean(network4))  # 41.68
#network: [2, [4], 1],    // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


network5 = np.array([54, 5, 65, 7, 29, 23, 30, 46, 20, 40, 14, 43, 20, 52, 31, 50, 38, 58, 9, 27, 14, 44, 47,
                     39, 40, 19, 37, 62, 68, 13, 159, 32, 95, 70, 38, 42, 46, 47, 50, 48, 41, 95, 27, 27, 41, 61, 9, 59, 41, 64])
print(np.mean(network5))  # 42.72
#network: [2, [5], 1],    // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


network6 = np.array([52, 7, 11, 91, 67, 27, 10, 29, 35, 35, 6, 15, 12, 93, 98, 14, 14, 219, 18, 117, 8, 159, 59,
                     17, 20, 120, 63, 311, 38, 103, 10, 5, 173, 11, 18, 56, 76, 76, 15, 110, 76, 19, 16, 60, 65, 75, 50, 37, 103, 12])
print(np.mean(network6))  # 58.62
#network: [2, [2], 1],    // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


network7 = np.array([294, 207, 12, 148, 63, 22, 132, 9, 142, 117, 337, 343, 167, 249, 8, 19, 127, 13, 257, 17, 111, 104, 269,
                     65, 94, 85, 118, 168, 20, 22, 35, 235, 387, 134, 28, 129, 10, 255, 196, 38, 319, 65, 107, 207, 20, 12, 205, 212, 16, 138])
print(np.mean(network7))  # 129.74
#network: [2, [1], 1],    // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight






print('\n')
###################################
######## TESTS PROPORTIONS ########
###################################


proportions1 = np.array([49, 57, 51, 71, 52, 17, 16, 24, 118, 39, 29, 61, 10, 8, 56, 10, 28, 228, 32, 60, 30, 69, 17, 15, 12,
                         107, 9, 34, 21, 17, 18, 90, 52, 29, 74, 45, 16, 18, 26, 33, 64, 44, 31, 39, 21, 34, 26, 19, 9, 8])
print(np.mean(proportions1))  # 40.86
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


proportions2 = np.array([88, 110, 75, 15, 19, 49, 80, 204, 191, 67, 75, 51, 98, 61, 42, 217, 292, 29, 92, 153, 81, 171,
                         50, 78, 78, 245, 163, 113, 324, 82, 29, 82, 63, 72, 11, 41, 48, 6, 84, 75, 47, 31, 155, 199, 108, 124, 197, 24, 10, 196])
print(np.mean(proportions2))  # 99.9
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.6,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.2,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight

proportions3 = np.array([64, 77, 108, 165, 25, 183, 90, 91, 59, 216, 8, 82, 83, 88, 17, 100, 185, 60, 81, 22, 105, 117, 195,
                         136, 62, 118, 80, 30, 24, 102, 45, 84, 118, 22, 60, 62, 93, 50, 152, 47, 231, 95, 174, 32, 59, 93, 36, 69, 142, 128])
print(np.mean(proportions3))  # 91.3
#network: [2, [3], 1],   // neural network structure
#population: 50,         // Population by generation
#elitism: 0.2,           // Best networks kept unchanged for the next generation(rate)
#randomBehaviour: 0.6,   // New random networks for the next generation(rate)
#mutationRate: 0.1,      // Mutation rate on the weights
#mutationRange: 0.5,     // Interval of the mutation changes on the weight


interesting = np.array([885, 171, 9960, 414, 11537])
