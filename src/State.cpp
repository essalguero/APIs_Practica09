#pragma once

#include "State.h"

std::shared_ptr<Shader>	State::defaultShader = nullptr;
glm::mat4 State::projectionMatrix;
glm::mat4 State::viewMatrix;
glm::mat4 State::modelMatrix;

std::vector<std::shared_ptr<Light>> State::lights;
glm::vec3 State::ambient;

glm::vec3 State::eyePos;

bool State::animation;
std::shared_ptr<std::vector<glm::mat4>> State::animMatrices;