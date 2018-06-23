#include "Model.h"
#include "State.h"

#include "common.h"

Model::Model(const std::shared_ptr<Mesh>& mesh)
{
	this->mesh = mesh;	

	animationsMatrix = std::make_shared<std::vector<glm::mat4>>();

	animationFrame = 0;

}

void Model::draw()
{
	// Calculate the model matrix
	State::modelMatrix = glm::translate(glm::mat4(), position);
	State::modelMatrix = glm::rotate(State::modelMatrix, glm::angle(rotationQuat), glm::axis(rotationQuat));
	State::modelMatrix = glm::scale(State::modelMatrix, scale);

	State::animation = modelAnimate;

	if (modelAnimate)
	{
		State::animMatrices = animationsMatrix;
	}

	// Draw the mesh
	mesh->draw();
}

void Model::animate(bool animate)
{
	modelAnimate = animate;
}

int Model::getFps() const
{
	return animationFps;
}

void Model::setFps(int fps)
{
	animationFps = fps;
}

float Model::getCurrentFrame() const
{
	return animationFrame;
}

void Model::setCurrentFrame(float frame)
{
	animationFrame = frame;
}

void Model::calculateAnimMatrices(float frame, const std::vector<Bone>& bones)
{
	animationsMatrix->clear();

	for (auto bonesIterator = bones.begin(); bonesIterator != bones.end(); ++bonesIterator)
	{
		int parent = bonesIterator->getParentIndex();
		glm::mat4 currentAnimMatrix;
		if (parent > -1)
		{
			currentAnimMatrix = animationsMatrix->at(parent) * (*bonesIterator).calculateAnimMatrix(animationFrame);
		}
		else
		{
			currentAnimMatrix = (*bonesIterator).calculateAnimMatrix(animationFrame);
		}

		animationsMatrix->push_back(currentAnimMatrix);

	}

	for (int i = 0; i < animationsMatrix->size(); ++i)
	{
		glm::mat4 currentMatrix = animationsMatrix->at(i);

		currentMatrix = currentMatrix * bones.at(i).getInvPoseMatrix();

		animationsMatrix->at(i) = currentMatrix;
		// Actualizar la matriz
	}

}

void Model::update(float deltaTime)
{
	animationFrame = animationFrame + (deltaTime * animationFps);
	if (animationFrame > mesh->getLastFrame())
	{
		animationFrame = 0;
	}
	else if (animationFrame < 0)
	{
		animationFrame = mesh->getLastFrame();
	}

	calculateAnimMatrices(animationFrame, mesh->getBones());
}