# 深度学习学习笔记

在学习深度学习的过程中，我整理了一些重要的概念和技术要点。

## 神经网络基础

### 前向传播

神经网络的前向传播过程可以表示为：

```python
import torch
import torch.nn as nn

class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

# 创建模型
model = SimpleNN(input_size=784, hidden_size=128, output_size=10)
```

### 反向传播

反向传播是训练神经网络的核心算法，它通过链式法则计算梯度：

$$
\frac{\partial L}{\partial w} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial w}
$$

## 常见的优化算法

### 1. SGD (随机梯度下降)

最基础的优化算法：

```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
```

### 2. Adam

自适应学习率优化算法：

```python
optimizer = torch.optim.Adam(model.parameters(), lr=0.001, betas=(0.9, 0.999))
```

## 重要概念

### 过拟合与正则化

**过拟合**是指模型在训练集上表现很好，但在测试集上表现较差。常见的解决方法：

- **Dropout**：随机丢弃一些神经元
- **L2 正则化**：在损失函数中添加权重惩罚项
- **数据增强**：增加训练数据的多样性
- **Early Stopping**：在验证集性能下降时停止训练

### Batch Normalization

批归一化可以加速训练并提高模型性能：

```python
class BNNetwork(nn.Module):
    def __init__(self):
        super(BNNetwork, self).__init__()
        self.fc1 = nn.Linear(784, 256)
        self.bn1 = nn.BatchNorm1d(256)
        self.fc2 = nn.Linear(256, 10)
    
    def forward(self, x):
        x = self.fc1(x)
        x = self.bn1(x)
        x = torch.relu(x)
        x = self.fc2(x)
        return x
```

## 实践经验

### 调参技巧

1. **学习率**：从较大的值开始，逐渐减小
2. **Batch Size**：通常选择 32、64、128 等 2 的幂次
3. **网络深度**：从浅层网络开始，逐步加深
4. **激活函数**：ReLU 是一个不错的默认选择

### 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 梯度消失 | 网络太深，使用 Sigmoid | 使用 ReLU，添加 BN |
| 梯度爆炸 | 学习率太大 | 降低学习率，梯度裁剪 |
| 过拟合 | 数据太少，模型太复杂 | 数据增强，Dropout |
| 训练慢 | Batch Size 太小 | 增大 Batch Size |

## 推荐资源

- 📖 **书籍**：《深度学习》（花书）- Ian Goodfellow
- 🎓 **课程**：Stanford CS231n
- 💻 **框架**：PyTorch, TensorFlow
- 📝 **论文**：arXiv.org

## 总结

深度学习是一个快速发展的领域，需要不断学习和实践。希望这些笔记能对你有所帮助！

---

*最后更新：2024年12月20日*

