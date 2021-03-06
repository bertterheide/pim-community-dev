<?php

namespace spec\Pim\Component\Catalog\Comparator\Field;

use PhpSpec\ObjectBehavior;

class ArrayComparatorSpec extends ObjectBehavior
{
    function let()
    {
        $this->beConstructedWith(['groups', 'categories', 'associations']);
    }

    function it_is_a_comparator()
    {
        $this->shouldBeAnInstanceOf('Pim\Component\Catalog\Comparator\ComparatorInterface');
    }

    function it_supports_comparison()
    {
        $this->supports('groups')->shouldBe(true);
        $this->supports('categories')->shouldBe(true);
        $this->supports('associations')->shouldBe(true);
        $this->supports('other')->shouldBe(false);
    }

    function it_gets_changes_when_adding_value()
    {
        $changes = ['akeneo_tshirt'];
        $originals = null;
        $this->compare($changes, $originals)->shouldReturn($changes);
    }

    function it_gets_changes_when_changing_value()
    {
        $changes = ['akeneo_tshirt'];
        $originals = ['oro_tshirt'];
        $this->compare($changes, $originals)->shouldReturn($changes);
    }

    function it_returns_null_when_values_are_the_same()
    {
        $changes = ['akeneo_tshirt'];
        $originals = ['akeneo_tshirt'];
        $this->compare($changes, $originals)->shouldReturn(null);

        $changes = ['oro_tshirt', 'akeneo_tshirt'];
        $originals = ['akeneo_tshirt', 'oro_tshirt'];
        $this->compare($changes, $originals)->shouldReturn(null);
    }
}
