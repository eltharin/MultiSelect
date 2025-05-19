<?php

namespace Eltharin\MultiSelectBundle;


use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;
use Symfony\Component\Yaml\Parser;

class EltharinMultiSelectBundle extends AbstractBundle
{
	public function prependExtension(ContainerConfigurator $container, ContainerBuilder $builder): void
	{

	}
}
